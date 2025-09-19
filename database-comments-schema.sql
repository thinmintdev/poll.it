-- Comments System Schema Extension
-- This extends the existing poll.it database with comments/chat functionality

-- Add comments_enabled column to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT FALSE;

-- Create comments table for poll discussions
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 1000),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For threaded replies (future feature)
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_polls_comments_enabled ON polls(comments_enabled);

-- Create trigger for comments updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for comments with user information
CREATE OR REPLACE VIEW comments_with_user AS
SELECT
  c.id,
  c.poll_id,
  c.user_id,
  c.content,
  c.parent_id,
  c.is_edited,
  c.created_at,
  c.updated_at,
  u.name as user_name,
  u.image as user_image,
  u.email as user_email
FROM comments c
JOIN users u ON c.user_id = u.id
ORDER BY c.created_at ASC;

-- Create function to get comments for a poll with user info
CREATE OR REPLACE FUNCTION get_poll_comments(poll_uuid UUID)
RETURNS TABLE (
  comment_id UUID,
  poll_id UUID,
  user_id UUID,
  user_name TEXT,
  user_image TEXT,
  content TEXT,
  parent_id UUID,
  is_edited BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id as comment_id,
    c.poll_id,
    c.user_id,
    u.name as user_name,
    u.image as user_image,
    c.content,
    c.parent_id,
    c.is_edited,
    c.created_at,
    c.updated_at
  FROM comments c
  JOIN users u ON c.user_id = u.id
  WHERE c.poll_id = poll_uuid
  ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get comment count for polls
CREATE OR REPLACE FUNCTION get_poll_comment_count(poll_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM comments
    WHERE poll_id = poll_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Update user_poll_stats view to include comment statistics
DROP VIEW IF EXISTS user_poll_stats;
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
  COALESCE(SUM(comment_counts.total_comments), 0) as total_comments_received,
  COUNT(user_comments.id) as total_comments_made,
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
LEFT JOIN (
  SELECT
    poll_id,
    COUNT(*) as total_comments
  FROM comments
  GROUP BY poll_id
) comment_counts ON comment_counts.poll_id = p.id
LEFT JOIN comments user_comments ON user_comments.user_id = u.id
GROUP BY u.id, u.name, u.email, u.image;

-- Grant necessary permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_poll_comments TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_poll_comment_count TO your_app_user;