const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initializeAuthSchema() {
  console.log('🚀 Initializing authentication database schema...');

  try {
    // Read the authentication schema SQL file
    const schemaPath = path.join(__dirname, '..', 'database-auth-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema creation
    await pool.query(schemaSql);

    console.log('✅ Authentication schema initialized successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up OAuth applications:');
    console.log('   - Google: https://console.developers.google.com/');
    console.log('   - GitHub: https://github.com/settings/applications/new');
    console.log('2. Update your .env.local with OAuth credentials');
    console.log('3. Start the development server: npm run dev');
    console.log('4. Test authentication at: http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Error initializing authentication schema:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeAuthSchema();