-- database/queries/upload_photo.sql
-- Inserts a photo record with processing status.
INSERT INTO photos (event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, created_at, updated_at;
