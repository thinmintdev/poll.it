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

async function restoreFromBackup(backupFilePath) {
  console.log(`🔄 Restoring database from backup: ${backupFilePath}`);
  
  try {
    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    console.log(`📦 Backup info:`);
    console.log(`   - Created: ${backupData.timestamp}`);
    console.log(`   - Polls: ${backupData.polls_count}`);
    console.log(`   - Total votes: ${backupData.total_votes}`);
    
    // Clear current database
    console.log('\n🗑️  Clearing current database...');
    await pool.query('DELETE FROM votes');
    await pool.query('DELETE FROM polls');
    
    // Restore polls and votes
    console.log('🌱 Restoring polls and votes...');
    
    for (const pollData of backupData.data) {
      // Insert poll
      const insertPollQuery = `
        INSERT INTO polls (id, question, options, allow_multiple_selections, max_selections, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      await pool.query(insertPollQuery, [
        pollData.id,
        pollData.question,
        pollData.options,
        pollData.allow_multiple_selections || false,
        pollData.max_selections || 1,
        pollData.created_at,
        pollData.updated_at
      ]);
      
      // Insert votes for this poll
      const votes = pollData.votes;
      if (votes && votes.length > 0) {
        for (const vote of votes) {
          const insertVoteQuery = `
            INSERT INTO votes (id, poll_id, option_index, voter_ip, voted_at)
            VALUES ($1, $2, $3, $4, $5)
          `;
          
          await pool.query(insertVoteQuery, [
            vote.id,
            pollData.id,
            vote.option_index,
            vote.voter_ip,
            vote.voted_at
          ]);
        }
      }
      
      console.log(`   ✓ Restored poll: ${pollData.question} (${votes?.length || 0} votes)`);
    }
    
    // Show final summary
    const pollCount = await pool.query('SELECT COUNT(*) as total FROM polls');
    const voteCount = await pool.query('SELECT COUNT(*) as total FROM votes');
    
    console.log('\n✅ Restore completed successfully!');
    console.log(`📊 Final summary:`);
    console.log(`   - Polls restored: ${pollCount.rows[0].total}`);
    console.log(`   - Votes restored: ${voteCount.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get backup file from command line argument or list available backups
const backupFile = process.argv[2];

if (!backupFile) {
  console.log('📁 Available backup files:');
  const backupDir = path.join(__dirname, 'backups');
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  files.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });
  console.log('\nUsage: node restore-backup.js <backup-filename>');
  console.log('Example: node restore-backup.js poll-backup-2025-08-05T20-00-46-872Z.json');
  process.exit(0);
}

const backupFilePath = path.join(__dirname, 'backups', backupFile);

if (!fs.existsSync(backupFilePath)) {
  console.error(`❌ Backup file not found: ${backupFilePath}`);
  process.exit(1);
}

// Run restore
restoreFromBackup(backupFilePath);
