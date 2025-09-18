const { Pool } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testAuthSetup() {
  console.log('🧪 Testing authentication database setup...');

  try {
    // Test 1: Check if users table exists and has correct structure
    const usersTable = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    if (usersTable.rows.length === 0) {
      console.error('❌ Users table not found. Run: npm run db:auth');
      process.exit(1);
    }

    console.log('✅ Users table found with columns:');
    usersTable.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test 2: Check if polls table has user_id column
    const pollsUserColumn = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'polls' AND column_name = 'user_id'
    `);

    if (pollsUserColumn.rows.length === 0) {
      console.error('❌ Polls table missing user_id column. Run: npm run db:auth');
      process.exit(1);
    }

    console.log('✅ Polls table has user_id column for ownership tracking');

    // Test 3: Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
      console.warn('   Update your .env.local file with these values');
    } else {
      console.log('✅ Required environment variables are set');
    }

    // Test 4: Check OAuth environment variables
    const oauthVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GITHUB_CLIENT_ID',
      'GITHUB_CLIENT_SECRET'
    ];

    const missingOAuthVars = oauthVars.filter(varName => !process.env[varName]);

    if (missingOAuthVars.length > 0) {
      console.warn(`⚠️  Missing OAuth variables: ${missingOAuthVars.join(', ')}`);
      console.warn('   Set up OAuth apps and update .env.local for full authentication');
    } else {
      console.log('✅ OAuth environment variables are configured');
    }

    console.log('\n🎉 Authentication setup test completed!');
    console.log('\n📋 Next steps:');
    if (missingOAuthVars.length > 0) {
      console.log('1. Set up OAuth applications (see docs/AUTHENTICATION_SETUP.md)');
      console.log('2. Update .env.local with OAuth credentials');
      console.log('3. Start the dev server: npm run dev');
    } else {
      console.log('1. Start the dev server: npm run dev');
      console.log('2. Test authentication at: http://localhost:3000/auth/signin');
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testAuthSetup();