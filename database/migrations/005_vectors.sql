-- 005_vectors.sql
-- Table structures for Face Embeddings and User Selfies, and vector search indices.

-- 1. Photo Faces Table (Stores face embeddings detected in event photos)
CREATE TABLE IF NOT EXISTS photo_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    box_x1 INT NOT NULL,
    box_y1 INT NOT NULL,
    box_x2 INT NOT NULL,
    box_y2 INT NOT NULL,
    embedding double precision[] NOT NULL, -- 512 dimensions for buffalo_l InsightFace model
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Selfies Table (Stores user selfie templates for each event)
CREATE TABLE IF NOT EXISTS selfies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    cloudinary_url TEXT NOT NULL,
    embedding double precision[] NOT NULL, -- 512 dimensions for matching
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, event_id)
);

-- Indexing for performance
-- Foreign Key index on photo_faces
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo_id ON photo_faces(photo_id);

-- Foreign Key indexes on selfies
CREATE INDEX IF NOT EXISTS idx_selfies_user_id ON selfies(user_id);
CREATE INDEX IF NOT EXISTS idx_selfies_event_id ON selfies(event_id);

-- HNSW Vector Index on photo_faces embedding (disabled for local environments without pgvector)
-- CREATE INDEX IF NOT EXISTS idx_photo_faces_embedding_hnsw 
-- ON photo_faces USING hnsw (embedding vector_cosine_ops)
-- WITH (m = 16, ef_construction = 64);
