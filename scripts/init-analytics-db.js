#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initAnalyticsDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database for analytics setup...');

    // Read the analytics schema file
    const schemaPath = path.join(__dirname, '..', 'analytics-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📊 Creating analytics tables and indexes...');
    await pool.query(schema);

    console.log('✅ Analytics database schema initialized successfully!');
    console.log('📈 Your poll.it analytics system is ready to track data.');

  } catch (error) {
    console.error('❌ Error initializing analytics database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('📝 Please make sure .env.local exists with your database URL');
  process.exit(1);
}

initAnalyticsDatabase();