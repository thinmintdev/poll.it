#!/usr/bin/env node

const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Testing Neon database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('polls', 'votes')
      ORDER BY table_name;
    `);
    
    console.log('📊 Found tables:', result.rows.map(row => row.table_name));
    
    if (result.rows.length === 2) {
      console.log('🎉 Database is properly initialized!');
    } else {
      console.log('⚠️  Some tables are missing. Run: npm run db:init');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

testConnection();
