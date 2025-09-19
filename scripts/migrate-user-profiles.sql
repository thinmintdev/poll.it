-- User Profile Update Migration
-- This migration ensures the users table supports avatar and display name updates
-- Run this if your database doesn't already have the complete user profile support

-- Add missing columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create or update the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for user profile queries if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Update the user_poll_stats view to include image field
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

-- Verify the schema is ready
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('name', 'image', 'updated_at')
ORDER BY column_name;

-- Test query to ensure user update functionality works
-- Uncomment and modify with a real user ID to test:
-- UPDATE users SET name = 'Test User', image = 'https://example.com/avatar.jpg' WHERE id = 'your-user-id-here';