-- database/queries/find_user_photos.sql
-- Performs cosine similarity lookup against HNSW index to find all photos containing the user's face.
SELECT DISTINCT p.id, p.event_id, p.uploaded_by, p.cloudinary_public_id, p.cloudinary_url, p.width, p.height, p.status, p.created_at
FROM photos p
JOIN photo_faces pf ON p.id = pf.photo_id
JOIN selfies s ON s.event_id = p.event_id
WHERE p.event_id = $1 
  AND s.user_id = $2
  AND p.status = 'processed'
  AND (pf.embedding <=> s.embedding) < $3 -- Parameterized cosine similarity threshold (typically 0.4)
ORDER BY p.created_at DESC;
