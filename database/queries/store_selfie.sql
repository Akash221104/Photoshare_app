-- database/queries/store_selfie.sql
-- Stores or updates a user selfie template for an event.
INSERT INTO selfies (user_id, event_id, cloudinary_public_id, cloudinary_url, embedding, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, event_id) 
DO UPDATE SET 
    cloudinary_public_id = EXCLUDED.cloudinary_public_id,
    cloudinary_url = EXCLUDED.cloudinary_url,
    embedding = EXCLUDED.embedding,
    updated_at = CURRENT_TIMESTAMP
RETURNING id, user_id, event_id, cloudinary_public_id, cloudinary_url, created_at, updated_at;
