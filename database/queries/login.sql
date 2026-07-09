-- database/queries/login.sql
-- Retrieves user details along with credentials for login verification.
SELECT u.id, u.name, u.email, u.email_verified, u.image, a.password
FROM users u
JOIN accounts a ON u.id = a.user_id
WHERE u.email = $1 AND a.provider_id = 'credential';
