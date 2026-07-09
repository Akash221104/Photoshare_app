-- database/queries/delete_event.sql
-- Deletes an event. Cascading deletes will trigger on related members, photos, and embeddings.
DELETE FROM events
WHERE id = $1;
