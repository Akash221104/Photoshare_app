-- 008_face_matching_pipeline.sql
-- Add quality, pose, size, and version metadata fields to photo_faces and create feedback loop table.

ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS yaw DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS pitch DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS roll DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS blur DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS brightness DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS sharpness DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_width INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_height INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_area INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_ratio DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_quality DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS occlusion_score DOUBLE PRECISION;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS image_width INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS image_height INT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS crop_url TEXT;
ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS processing_version VARCHAR(50) DEFAULT 'v1' NOT NULL;

-- Create user_feedback table for feedback loops
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    face_id UUID NOT NULL REFERENCES photo_faces(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'is_me' or 'not_me'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_feedback_type CHECK (feedback_type IN ('is_me', 'not_me')),
    UNIQUE(user_id, face_id)
);
