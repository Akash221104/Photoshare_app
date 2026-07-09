-- 007_event_upload_mode.sql
-- Add upload_mode to events table supporting 'ALL' and 'HOST_ONLY' settings.

ALTER TABLE events ADD COLUMN IF NOT EXISTS upload_mode VARCHAR(50) DEFAULT 'ALL' NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'chk_event_upload_mode'
    ) THEN
        ALTER TABLE events ADD CONSTRAINT chk_event_upload_mode CHECK (upload_mode IN ('ALL', 'HOST_ONLY'));
    END IF;
END
$$;
