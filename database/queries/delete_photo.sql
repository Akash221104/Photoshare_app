-- database/queries/delete_photo.sql
-- Deletes a photo. Cascading deletes will remove associated photo faces (embeddings).
DELETE FROM photos
WHERE id = $1;
