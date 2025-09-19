#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function addDescriptionField() {
  console.log('🔄 Adding description field to polls table...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Add description column to polls table
    console.log('Adding description column...');
    await pool.query(`
      ALTER TABLE polls
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);

    // Add comment to document the field
    await pool.query(`
      COMMENT ON COLUMN polls.description IS 'Optional description for the poll, displayed under the question';
    `);

    console.log('✅ Description field added successfully!');

    // Verify the table structure
    console.log('\n📋 Updated polls table structure:');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'polls'
      ORDER BY ordinal_position;
    `);

    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });

  } catch (error) {
    console.error('❌ Error adding description field:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await pool.end();
  }
}

addDescriptionField();