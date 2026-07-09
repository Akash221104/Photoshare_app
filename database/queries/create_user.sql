-- database/queries/create_user.sql
-- Creates a new user record.
INSERT INTO users (name, email, email_verified, image, created_at, updated_at)
VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id, name, email, email_verified, image, created_at, updated_at;
