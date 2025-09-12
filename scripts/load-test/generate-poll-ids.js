const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function generatePollIds() {
  try {
    console.log('📋 Generating poll IDs for Artillery load test...');
    
    // Get all poll IDs
    const result = await pool.query('SELECT id FROM polls ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      console.error('❌ No polls found! Run the sample data script first.');
      process.exit(1);
    }
    
    // Create CSV file for Artillery
    const csvContent = 'pollId\n' + result.rows.map(row => row.id).join('\n');
    
    const csvPath = path.join(__dirname, 'poll-ids.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    console.log(`✅ Generated poll IDs CSV: ${csvPath}`);
    console.log(`📊 Found ${result.rows.length} polls for load testing`);
    
    return result.rows.length;
  } catch (error) {
    console.error('❌ Error generating poll IDs:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generatePollIds();
