-- database/queries/store_embedding.sql
-- Stores a detected face coordinate box and its 512-dimension vector embedding.
INSERT INTO photo_faces (photo_id, box_x1, box_y1, box_x2, box_y2, embedding, created_at)
VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
RETURNING id, photo_id, box_x1, box_y1, box_x2, box_y2, created_at;
