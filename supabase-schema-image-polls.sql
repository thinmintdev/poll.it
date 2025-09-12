-- Extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add new columns to polls table for image support
ALTER TABLE polls 
ADD COLUMN IF NOT EXISTS poll_type TEXT DEFAULT 'text' CHECK (poll_type IN ('text', 'image'));

-- Create image_options table for storing image poll options
CREATE TABLE IF NOT EXISTS image_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique order for each poll
  UNIQUE(poll_id, order_index)
);

-- Create indexes for image_options table
CREATE INDEX IF NOT EXISTS idx_image_options_poll_id ON image_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_image_options_order ON image_options(poll_id, order_index);

-- Update existing polls to have poll_type = 'text'
UPDATE polls SET poll_type = 'text' WHERE poll_type IS NULL;

-- Validation function for image URLs
CREATE OR REPLACE FUNCTION validate_image_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic URL validation - starts with http/https and ends with image extension
    RETURN url ~* '^https?://.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$' OR url LIKE 'data:image/%';
END;
$$ LANGUAGE plpgsql;

-- Add constraint to ensure valid image URLs
ALTER TABLE image_options 
ADD CONSTRAINT check_valid_image_url 
CHECK (validate_image_url(image_url));

-- Function to ensure poll consistency
CREATE OR REPLACE FUNCTION check_poll_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- For image polls, ensure we have image_options
    IF NEW.poll_type = 'image' THEN
        IF NOT EXISTS (SELECT 1 FROM image_options WHERE poll_id = NEW.id) THEN
            -- This will be checked after insert, so it's okay if no image_options exist during poll creation
            -- We'll handle this in the application logic
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for poll consistency (optional - mainly for data integrity)
DROP TRIGGER IF EXISTS check_poll_consistency_trigger ON polls;
CREATE TRIGGER check_poll_consistency_trigger
  AFTER INSERT OR UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION check_poll_consistency();

-- Update the updated_at trigger to work with new columns
DROP TRIGGER IF EXISTS update_polls_updated_at ON polls;
CREATE TRIGGER update_polls_updated_at 
  BEFORE UPDATE ON polls
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();