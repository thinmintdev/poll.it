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
      AND column_name IN ('allow_multiple_selections', 'max_selections')
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
    console.log('🎉 Your poll.it database now supports multiple selections.');
    
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