#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initCommentsSchema() {
  console.log('🚀 Initializing comments database schema...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    // Read the comments schema SQL file
    const schemaPath = path.join(__dirname, '..', 'database-comments-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    console.log('✅ Comments schema initialized successfully!');
    console.log('');
    console.log('📋 Comments tables created:');
    console.log('  - comments (with user references and threading support)');
    console.log('  - indexes for performance optimization');
    console.log('  - triggers for updated_at timestamps');

  } catch (error) {
    console.error('❌ Error initializing comments schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initCommentsSchema();