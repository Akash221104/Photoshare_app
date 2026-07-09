-- database/queries/join_event.sql
-- Joins a user to an event by adding a record to event_members.
INSERT INTO event_members (event_id, user_id, role, joined_at)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
RETURNING id, event_id, user_id, role, joined_at;
