-- Fix vote constraint for multiple selections
-- This script removes the problematic constraint and ensures the correct one is in place

-- Drop the old constraint that prevents multiple votes per voter per poll
DROP INDEX IF EXISTS idx_votes_unique_voter_per_poll;

-- Ensure the correct constraint exists (allows multiple votes but prevents duplicate option votes)
DROP INDEX IF EXISTS idx_votes_unique_voter_option_per_poll;
CREATE UNIQUE INDEX idx_votes_unique_voter_option_per_poll ON votes(poll_id, voter_ip, option_index);

-- Verify the constraint was created properly
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'votes' 
AND indexname LIKE '%unique%';
