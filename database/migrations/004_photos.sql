-- 004_photos.sql
-- Table structure for storing Event Photos.

-- 1. Photos Table
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cloudinary_public_id VARCHAR(255) NOT NULL,
    cloudinary_url TEXT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    status VARCHAR(50) DEFAULT 'processing' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_photo_status CHECK (status IN ('processing', 'processed', 'failed'))
);

-- Indexing for performance
-- Quick retrieval of photos inside an event
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);

-- Quick check on who uploaded what photo
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);
