-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication and profile management
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

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- Storing as JSON string for Neon compatibility
  allow_multiple_selections BOOLEAN DEFAULT FALSE,
  max_selections INTEGER DEFAULT 1,
  poll_type TEXT DEFAULT 'text',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  allow_anonymous_voting BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voter_ip TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON polls(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_public ON polls(is_public);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_ip ON votes(voter_ip);
-- For multiple selections, we need unique constraint on poll_id, voter_ip, and option_index
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_voter_option_per_poll ON votes(poll_id, voter_ip, option_index);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for user poll statistics
CREATE OR REPLACE VIEW user_poll_stats AS
SELECT
  u.id as user_id,
  u.name,
  u.email,
  u.image,
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
GROUP BY u.id, u.name, u.email, u.image;

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
