-- Database indexes for performance optimization
-- Run these commands in your Supabase SQL editor or database console

-- Index for polls table - most common queries
-- 1. Index for filtering by visibility and ordering by created_at (for recent polls)
CREATE INDEX IF NOT EXISTS idx_polls_visibility_created_at 
ON polls (visibility, created_at DESC);

-- 2. Index for filtering by category_id
CREATE INDEX IF NOT EXISTS idx_polls_category_id 
ON polls (category_id);

-- 3. Index for filtering by user_id (for user's polls)
CREATE INDEX IF NOT EXISTS idx_polls_user_id 
ON polls (user_id);

-- 4. Composite index for public polls by category and creation time
CREATE INDEX IF NOT EXISTS idx_polls_public_category_created 
ON polls (visibility, category_id, created_at DESC);

-- Index for choices table
-- 5. Index for poll_id foreign key (should already exist, but ensuring it's optimized)
CREATE INDEX IF NOT EXISTS idx_choices_poll_id 
ON choices (poll_id);

-- Index for votes table (assuming it exists based on the code)
-- 6. Index for choice_id foreign key for vote counting
CREATE INDEX IF NOT EXISTS idx_votes_choice_id 
ON votes (choice_id);

-- 7. Index for poll_id in votes for filtering votes by poll
CREATE INDEX IF NOT EXISTS idx_votes_poll_id 
ON votes (poll_id);

-- 8. Composite index for unique vote tracking (if you want to prevent duplicate votes)
-- This assumes you have user_id or some identifier in votes table
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_user_choice 
-- ON votes (user_id, choice_id);

-- Index for categories table
-- 9. Index for category name for lookups
CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories (name);

-- Performance improvement queries you can also run:

-- Update table statistics for better query planning
ANALYZE polls;
ANALYZE choices;
ANALYZE votes;
ANALYZE categories;

-- Optional: If you have many old polls, you might want to partition by date
-- This is more advanced and should be done carefully in production

-- Index usage notes:
-- - idx_polls_visibility_created_at: Optimizes the main recent polls query
-- - idx_polls_category_id: Speeds up filtering by category
-- - idx_polls_user_id: Speeds up user dashboard queries
-- - idx_polls_public_category_created: Optimizes category-specific recent polls
-- - idx_choices_poll_id: Ensures fast choice retrieval for poll display
-- - idx_votes_choice_id: Optimizes vote counting aggregations
-- - idx_votes_poll_id: Speeds up vote queries filtered by poll

-- Monitor index usage with:
-- SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public';