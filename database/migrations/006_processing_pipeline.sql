-- 006_processing_pipeline.sql
-- Modify schemas to support processing status tracking, PGVector, and metadata attributes.

-- 1. Modify photos table to add status columns
ALTER TABLE photos ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS processing_error TEXT;

-- Add check constraint for processing_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'chk_processing_status'
    ) THEN
        ALTER TABLE photos ADD CONSTRAINT chk_processing_status CHECK (processing_status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'));
    END IF;
END
$$;

-- 2. Modify photo_faces table to support bounding box coordinates, confidence, vector(512), and metadata
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS x INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS y INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS width INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS height INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS model_name VARCHAR(50) DEFAULT 'buffalo_l' NOT NULL;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS embedding_dimension INT DEFAULT 512 NOT NULL;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_index INT DEFAULT 0 NOT NULL;

-- 3. Conditionally enable pgvector and alter columns if the extension is available
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_available_extensions WHERE name = 'vector'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS vector;
        
        -- Alter existing columns to vector(512)
        ALTER TABLE photo_faces ALTER COLUMN embedding TYPE vector(512) USING embedding::vector(512);
        ALTER TABLE selfies ALTER COLUMN embedding TYPE vector(512) USING embedding::vector(512);
        
        -- Re-create index for vector search
        DROP INDEX IF EXISTS idx_photo_faces_embedding_hnsw;
        CREATE INDEX IF NOT EXISTS idx_photo_faces_embedding_hnsw 
        ON photo_faces USING hnsw (embedding vector_cosine_ops)
        WITH (m = 16, ef_construction = 64);
        
        RAISE NOTICE 'pgvector enabled and columns updated to VECTOR(512) type.';
    ELSE
        RAISE NOTICE 'pgvector extension not available. Falling back to double precision[].';
    END IF;
END $$;
