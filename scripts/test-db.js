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
    
    // Test if basic tables exist
    const basicResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('polls', 'votes')
      ORDER BY table_name;
    `);

    // Test if auth tables exist
    const authResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'accounts', 'sessions')
      ORDER BY table_name;
    `);

    // Test if comments table exists
    const commentsResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'comments';
    `);

    console.log('📊 Found basic tables:', basicResult.rows.map(row => row.table_name));
    console.log('🔐 Found auth tables:', authResult.rows.map(row => row.table_name));
    console.log('💬 Found comments tables:', commentsResult.rows.map(row => row.table_name));

    if (basicResult.rows.length === 2) {
      console.log('🎉 Basic database is properly initialized!');
    } else {
      console.log('⚠️  Basic tables missing. Run: npm run db:init');
    }

    if (authResult.rows.length === 3) {
      console.log('🔐 Authentication system is ready!');
    } else {
      console.log('⚠️  Auth tables missing. Run: npm run db:auth');
    }

    if (commentsResult.rows.length === 1) {
      console.log('💬 Comments system is ready!');
    } else {
      console.log('⚠️  Comments table missing. Run: node scripts/init-comments-db.js');
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
