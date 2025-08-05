-- Migration script to add multiple selections support to existing poll.it database
-- Run this script against your existing database to add the new fields

-- Add new columns to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS allow_multiple_selections BOOLEAN DEFAULT FALSE;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS max_selections INTEGER DEFAULT 1;

-- Drop old unique constraint and create new one
DROP INDEX IF EXISTS idx_votes_unique_voter_per_poll;
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_voter_option_per_poll ON votes(poll_id, voter_ip, option_index);

-- Update existing polls to have default values
UPDATE polls SET allow_multiple_selections = FALSE, max_selections = 1 WHERE allow_multiple_selections IS NULL;