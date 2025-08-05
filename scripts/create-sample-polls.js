const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const samplePolls = [
  {
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "Go", "Rust", "TypeScript"]
  },
  {
    question: "Which web framework do you prefer?",
    options: ["React", "Vue.js", "Angular", "Svelte", "Next.js"]
  },
  {
    question: "What's the best way to learn programming?",
    options: ["Online courses", "Bootcamps", "University", "Self-taught", "Mentorship"]
  },
  {
    question: "Which operating system do you use for development?",
    options: ["macOS", "Windows", "Linux Ubuntu", "Linux Arch", "Other Linux"]
  },
  {
    question: "What's your preferred code editor?",
    options: ["VS Code", "WebStorm", "Vim/Neovim", "Sublime Text", "Atom"]
  },
  {
    question: "How many hours do you code per day?",
    options: ["Less than 2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "More than 8 hours"]
  },
  {
    question: "What's the most important skill for a developer?",
    options: ["Problem solving", "Communication", "Continuous learning", "Technical expertise", "Time management"]
  },
  {
    question: "Which database do you prefer?",
    options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis"]
  },
  {
    question: "What's your favorite deployment platform?",
    options: ["Vercel", "Netlify", "AWS", "Digital Ocean", "Heroku"]
  },
  {
    question: "How do you stay updated with tech trends?",
    options: ["Twitter/X", "Dev.to", "YouTube", "Podcasts", "Tech blogs"]
  }
];

async function createSamplePolls() {
  try {
    console.log('Creating sample polls...');
    
    for (let i = 0; i < samplePolls.length; i++) {
      const poll = samplePolls[i];
      
      const insertQuery = `
        INSERT INTO polls (question, options)
        VALUES ($1, $2)
        RETURNING id, question
      `;
      
      const result = await pool.query(insertQuery, [
        poll.question,
        JSON.stringify(poll.options)
      ]);
      
      console.log(`✓ Created poll ${i + 1}: ${result.rows[0].question}`);
      
      // Add some random votes to make the polls more interesting
      const pollId = result.rows[0].id;
      const numVotes = Math.floor(Math.random() * 50) + 10; // 10-60 votes per poll
      
      for (let j = 0; j < numVotes; j++) {
        const randomOptionIndex = Math.floor(Math.random() * poll.options.length);
        const randomIp = `192.168.1.${Math.floor(Math.random() * 255)}`;
        
        try {
          await pool.query(
            'INSERT INTO votes (poll_id, option_index, voter_ip) VALUES ($1, $2, $3)',
            [pollId, randomOptionIndex, randomIp]
          );
        } catch (error) {
          // Ignore duplicate vote errors (same IP voting twice)
          if (!error.message.includes('duplicate key')) {
            console.warn(`Warning adding vote: ${error.message}`);
          }
        }
      }
      
      console.log(`  Added ${numVotes} votes`);
    }
    
    console.log('\n✅ All sample polls created successfully!');
    
    // Show summary
    const countResult = await pool.query('SELECT COUNT(*) as total FROM polls');
    console.log(`Total polls in database: ${countResult.rows[0].total}`);
    
  } catch (error) {
    console.error('Error creating sample polls:', error);
  } finally {
    await pool.end();
  }
}

createSamplePolls();
