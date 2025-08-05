const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPolls() {
  try {
    // Get polls with their options and vote counts
    const pollsQuery = `
      SELECT 
        p.id,
        p.question,
        p.options,
        p.created_at,
        (
          SELECT json_agg(
            json_build_object(
              'index', v.option_index,
              'count', v.vote_count
            )
          )
          FROM (
            SELECT option_index, COUNT(*) as vote_count
            FROM votes
            WHERE poll_id = p.id
            GROUP BY option_index
          ) v
        ) as vote_counts
      FROM polls p
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    const result = await pool.query(pollsQuery);
    console.log('Available polls with vote counts:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPolls();
