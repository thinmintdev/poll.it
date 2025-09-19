-- Migration to add hide_results column to polls table
-- This adds support for hiding poll results with three options:
-- 'none' (default) - Results are always visible
-- 'until_vote' - Results are hidden until user votes
-- 'entirely' - Results are only visible to poll creator (requires authentication)

-- Add the hide_results column
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS hide_results TEXT DEFAULT 'none'
CHECK (hide_results IN ('none', 'until_vote', 'entirely'));

-- Add index for performance when filtering by hide_results
CREATE INDEX IF NOT EXISTS idx_polls_hide_results ON polls(hide_results);

-- Add description column that was missing from main schema but exists in TypeScript
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comments_enabled column that was missing from main schema but exists in TypeScript
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN DEFAULT FALSE;