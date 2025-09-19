-- Add description field to polls table
-- This migration adds an optional description field for polls

-- Add description column to polls table
ALTER TABLE polls
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment to document the field
COMMENT ON COLUMN polls.description IS 'Optional description for the poll, displayed under the question';

-- Update the updated_at trigger to include the new column (if needed)
-- The existing trigger should automatically handle this, but let's verify the table structure

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'polls'
ORDER BY ordinal_position;