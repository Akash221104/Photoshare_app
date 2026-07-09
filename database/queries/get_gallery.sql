-- database/queries/get_gallery.sql
-- Retrieves all processed photos uploaded to a specific event workspace.
SELECT id, event_id, uploaded_by, cloudinary_public_id, cloudinary_url, width, height, status, created_at
FROM photos
WHERE event_id = $1 AND status = 'processed'
ORDER BY created_at DESC;
