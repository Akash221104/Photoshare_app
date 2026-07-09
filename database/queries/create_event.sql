-- database/queries/create_event.sql
-- Inserts a new event record into the database.
INSERT INTO events (name, description, join_code, host_id, created_at, updated_at)
VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, name, description, join_code, host_id, created_at, updated_at;
