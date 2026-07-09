-- 003_events.sql
-- Table structures for Events and Event Members.

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    join_code VARCHAR(10) NOT NULL UNIQUE,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Event Members Table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'guest' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_member_role CHECK (role IN ('host', 'guest', 'admin')),
    UNIQUE(event_id, user_id)
);

-- Indexing for performance
-- Quick lookups of events by host
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);

-- Quick lookups by join code (should be fast as it is unique, but explicit index is good)
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_join_code ON events(join_code);

-- Foreign key indexes on join table
CREATE INDEX IF NOT EXISTS idx_event_members_event_id ON event_members(event_id);
CREATE INDEX IF NOT EXISTS idx_event_members_user_id ON event_members(user_id);
