-- Authentication and User Management Schema Extension
-- This extends the existing poll.it database with user accounts and OAuth integration

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for OAuth authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  image TEXT,
  provider TEXT NOT NULL, -- 'google', 'github', etc.
  provider_id TEXT NOT NULL, -- OAuth provider's user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Note: We're using JWT sessions instead of database sessions for simplicity
-- The users table is sufficient for our OAuth implementation with NextAuth.js JWT strategy

-- Modify existing polls table to add user ownership (optional for backward compatibility)
ALTER TABLE polls ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_anonymous_voting BOOLEAN DEFAULT TRUE;

-- Add indexes for user-related queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_public ON polls(is_public);

-- Create trigger for users table updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for user poll statistics
CREATE OR REPLACE VIEW user_poll_stats AS
SELECT
  u.id as user_id,
  u.name,
  u.email,
  COUNT(p.id) as total_polls,
  COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as polls_last_30_days,
  COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as polls_last_7_days,
  COALESCE(SUM(vote_counts.total_votes), 0) as total_votes_received,
  MAX(p.created_at) as last_poll_created
FROM users u
LEFT JOIN polls p ON p.user_id = u.id
LEFT JOIN (
  SELECT
    poll_id,
    COUNT(*) as total_votes
  FROM votes
  GROUP BY poll_id
) vote_counts ON vote_counts.poll_id = p.id
GROUP BY u.id, u.name, u.email;

-- Create function to get poll results with vote counts
CREATE OR REPLACE FUNCTION get_poll_with_votes(poll_uuid UUID)
RETURNS TABLE (
  poll_id UUID,
  question TEXT,
  options TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  option_index INTEGER,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as poll_id,
    p.question,
    p.options,
    p.user_id,
    p.created_at,
    v.option_index,
    COUNT(v.id) as vote_count
  FROM polls p
  LEFT JOIN votes v ON p.id = v.poll_id
  WHERE p.id = poll_uuid
  GROUP BY p.id, p.question, p.options, p.user_id, p.created_at, v.option_index
  ORDER BY v.option_index;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users, accounts, sessions, verification_tokens, polls, votes TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_poll_with_votes TO your_app_user;