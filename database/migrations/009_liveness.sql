-- 009_liveness.sql
-- Table structure for active liveness challenge sessions.

CREATE TABLE IF NOT EXISTS liveness_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    challenges JSONB NOT NULL, -- e.g., [{"id": "LOOK_LEFT", "type": "POSE"}, ...]
    attempt_count INT DEFAULT 1 NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, PASSED, FAILED
    score NUMERIC(5, 2), -- final computed liveness score (0.00 to 100.00)
    failure_reason TEXT, -- detail of failed checks
    ip_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of user's IP
    user_agent_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of user's User Agent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, event_id)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_liveness_sessions_user_event ON liveness_sessions(user_id, event_id);
