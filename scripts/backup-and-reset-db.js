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

// Sample polls data
const samplePolls = [
  {
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "Go", "Rust", "TypeScript"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "Which web frameworks do you use regularly? (Select multiple)",
    options: ["React", "Vue.js", "Angular", "Svelte", "Next.js", "Express.js"],
    allow_multiple_selections: true,
    max_selections: 3
  },
  {
    question: "What's the best way to learn programming?",
    options: ["Online courses", "Bootcamps", "University", "Self-taught", "Mentorship"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "Which operating systems do you develop on? (Select all that apply)",
    options: ["macOS", "Windows", "Linux Ubuntu", "Linux Arch", "Other Linux"],
    allow_multiple_selections: true,
    max_selections: 5
  },
  {
    question: "What's your preferred code editor?",
    options: ["VS Code", "WebStorm", "Vim/Neovim", "Sublime Text", "Atom"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "How many hours do you code per day?",
    options: ["Less than 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "More than 8 hours"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "What are the most important skills for a developer? (Choose up to 2)",
    options: ["Problem solving", "Communication", "Continuous learning", "Technical expertise", "Time management"],
    allow_multiple_selections: true,
    max_selections: 2
  },
  {
    question: "Which databases do you work with? (Multiple selections allowed)",
    options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Firebase"],
    allow_multiple_selections: true,
    max_selections: 4
  },
  {
    question: "What's your favorite deployment platform?",
    options: ["Vercel", "Netlify", "AWS", "Digital Ocean", "Heroku"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "How do you stay updated with tech trends?",
    options: ["Twitter/X", "Dev.to", "YouTube", "Podcasts", "Tech blogs"],
    allow_multiple_selections: false,
    max_selections: 1
  },
  {
    question: "Which design tools do you use? (Select multiple)",
    options: ["Figma", "Adobe XD", "Sketch", "Canva", "Photoshop"],
    allow_multiple_selections: true,
    max_selections: 3
  },
  {
    question: "What's your experience level?",
    options: ["Beginner (0-1 years)", "Junior (1-3 years)", "Mid-level (3-5 years)", "Senior (5-8 years)", "Expert (8+ years)"],
    allow_multiple_selections: false,
    max_selections: 1
  }
];

async function backupDatabase() {
  console.log('📦 Creating database backup...');
  
  try {
    // Get all polls with their data
    const pollsResult = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'option_index', v.option_index,
              'voter_ip', v.voter_ip,
              'voted_at', v.voted_at
            )
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'::json
        ) as votes
      FROM polls p
      LEFT JOIN votes v ON p.id = v.poll_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    const backupData = {
      timestamp: new Date().toISOString(),
      polls_count: pollsResult.rows.length,
      total_votes: await getTotalVotes(),
      data: pollsResult.rows
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `poll-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`   - ${backupData.polls_count} polls backed up`);
    console.log(`   - ${backupData.total_votes} total votes backed up`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
}

async function getTotalVotes() {
  const result = await pool.query('SELECT COUNT(*) as total FROM votes');
  return parseInt(result.rows[0].total);
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing polls and votes...');
  
  try {
    // Clear votes first (due to foreign key constraint)
    const votesResult = await pool.query('DELETE FROM votes');
    console.log(`   - Deleted ${votesResult.rowCount} votes`);
    
    // Clear polls
    const pollsResult = await pool.query('DELETE FROM polls');
    console.log(`   - Deleted ${pollsResult.rowCount} polls`);
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function createSamplePolls() {
  console.log('🌱 Creating sample polls...');
  
  try {
    for (let i = 0; i < samplePolls.length; i++) {
      const poll = samplePolls[i];
      
      const insertQuery = `
        INSERT INTO polls (question, options, allow_multiple_selections, max_selections)
        VALUES ($1, $2, $3, $4)
        RETURNING id, question
      `;
      
      const result = await pool.query(insertQuery, [
        poll.question,
        JSON.stringify(poll.options),
        poll.allow_multiple_selections,
        poll.max_selections
      ]);
      
      console.log(`   ✓ Created poll ${i + 1}: ${result.rows[0].question}`);
      
      // Add realistic random votes
      const pollId = result.rows[0].id;
      await addRandomVotes(pollId, poll);
    }
    
    console.log('✅ All sample polls created successfully!');
    
    // Show summary
    const countResult = await pool.query('SELECT COUNT(*) as total FROM polls');
    const votesResult = await pool.query('SELECT COUNT(*) as total FROM votes');
    console.log(`\n📊 Database Summary:`);
    console.log(`   - Total polls: ${countResult.rows[0].total}`);
    console.log(`   - Total votes: ${votesResult.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error creating sample polls:', error);
    throw error;
  }
}

async function addRandomVotes(pollId, poll) {
  const numVoters = Math.floor(Math.random() * 80) + 20; // 20-100 voters per poll
  const votesAdded = [];
  
  for (let i = 0; i < numVoters; i++) {
    const voterIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    if (poll.allow_multiple_selections) {
      // For multiple selection polls, some voters select multiple options
      const numSelections = Math.floor(Math.random() * Math.min(poll.max_selections, poll.options.length)) + 1;
      const selectedOptions = new Set();
      
      while (selectedOptions.size < numSelections) {
        selectedOptions.add(Math.floor(Math.random() * poll.options.length));
      }
      
      for (const optionIndex of selectedOptions) {
        try {
          await pool.query(
            'INSERT INTO votes (poll_id, option_index, voter_ip) VALUES ($1, $2, $3)',
            [pollId, optionIndex, voterIp]
          );
          votesAdded.push({ voter: i + 1, option: optionIndex });
        } catch (error) {
          // Skip duplicate votes
          if (!error.message.includes('duplicate key')) {
            console.warn(`Warning adding vote: ${error.message}`);
          }
        }
      }
    } else {
      // Single selection poll
      const randomOptionIndex = Math.floor(Math.random() * poll.options.length);
      
      try {
        await pool.query(
          'INSERT INTO votes (poll_id, option_index, voter_ip) VALUES ($1, $2, $3)',
          [pollId, randomOptionIndex, voterIp]
        );
        votesAdded.push({ voter: i + 1, option: randomOptionIndex });
      } catch (error) {
        // Skip duplicate votes
        if (!error.message.includes('duplicate key')) {
          console.warn(`Warning adding vote: ${error.message}`);
        }
      }
    }
  }
  
  console.log(`     Added ${votesAdded.length} votes from ${numVoters} voters`);
}

async function main() {
  console.log('🚀 Starting database backup and reset process...\n');
  
  try {
    // Step 1: Backup
    const backupFile = await backupDatabase();
    
    console.log('\n' + '='.repeat(50));
    
    // Step 2: Clear
    await clearDatabase();
    
    console.log('\n' + '='.repeat(50));
    
    // Step 3: Repopulate
    await createSamplePolls();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database reset completed successfully!');
    console.log(`📁 Backup saved to: ${path.basename(backupFile)}`);
    
  } catch (error) {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main();
