-- 001_extensions.sql
-- Enables system-wide extensions for vector similarity matching and UUID generation.

-- Enable uuid-ossp for standard RFC 4122 UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for high-performance vector representation and search
-- CREATE EXTENSION IF NOT EXISTS vector;
