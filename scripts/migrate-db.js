#!/usr/bin/env node

const { Pool } = require('pg');

async function migrateDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to Neon database...');
    
    // Check if columns exist
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'polls' 
      AND column_name IN ('allow_multiple_selections', 'max_selections', 'poll_type')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('📋 Existing columns:', existingColumns);

    // Add missing columns
    if (!existingColumns.includes('allow_multiple_selections')) {
      console.log('➕ Adding allow_multiple_selections column...');
      await pool.query('ALTER TABLE polls ADD COLUMN allow_multiple_selections BOOLEAN DEFAULT FALSE');
    }

    if (!existingColumns.includes('max_selections')) {
      console.log('➕ Adding max_selections column...');
      await pool.query('ALTER TABLE polls ADD COLUMN max_selections INTEGER DEFAULT 1');
    }

    if (!existingColumns.includes('poll_type')) {
      console.log('➕ Adding poll_type column...');
      await pool.query(`ALTER TABLE polls ADD COLUMN poll_type TEXT DEFAULT 'text' CHECK (poll_type IN ('text', 'image'))`);
    }

    // Check if image_options table exists
    const checkImageTable = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'image_options'
    `);

    if (checkImageTable.rows.length === 0) {
      console.log('➕ Creating image_options table...');
      
      // Create UUID extension if not exists
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // Create image_options table
      await pool.query(`
        CREATE TABLE image_options (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          caption TEXT,
          order_index INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          
          -- Ensure unique order for each poll
          UNIQUE(poll_id, order_index)
        )
      `);

      // Create indexes for image_options table
      await pool.query('CREATE INDEX IF NOT EXISTS idx_image_options_poll_id ON image_options(poll_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_image_options_order ON image_options(poll_id, order_index)');

      // Validation function for image URLs
      await pool.query(`
        CREATE OR REPLACE FUNCTION validate_image_url(url TEXT)
        RETURNS BOOLEAN AS $$
        BEGIN
            -- Basic URL validation - starts with http/https and ends with image extension
            RETURN url ~* '^https?://.*\\.(jpg|jpeg|png|gif|webp|svg)(\\?.*)?$' OR url LIKE 'data:image/%';
        END;
        $$ LANGUAGE plpgsql
      `);

      // Add constraint to ensure valid image URLs
      await pool.query(`
        ALTER TABLE image_options 
        ADD CONSTRAINT check_valid_image_url 
        CHECK (validate_image_url(image_url))
      `);

      console.log('✅ Image polls table and functions created successfully!');
    }

    // Update the unique constraint for votes table to support multiple selections
    console.log('🔄 Updating votes table constraints...');
    
    // Drop existing constraint if it exists
    try {
      await pool.query('DROP INDEX IF EXISTS votes_poll_id_voter_ip_key');
    } catch (e) {
      // Ignore if constraint doesn't exist
    }

    // Create new unique constraint
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique_voter_option_per_poll 
      ON votes(poll_id, voter_ip, option_index)
    `);

    console.log('✅ Database migration completed successfully!');
    console.log('🎉 Your poll.it database now supports multiple selections and image polls.');
    
  } catch (error) {
    console.error('❌ Error migrating database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('📝 Please make sure .env.local exists with your Neon database URL');
  process.exit(1);
}

migrateDatabase();