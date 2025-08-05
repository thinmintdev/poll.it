import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { PollResults } from '@/types/poll'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: pollId } = params

    // Get poll data
    const pollResult = await query('SELECT * FROM polls WHERE id = $1', [pollId])
    
    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    const poll = pollResult.rows[0]
    
    // Parse options if they're stored as JSON string
    if (typeof poll.options === 'string') {
      poll.options = JSON.parse(poll.options)
    }

    // Get vote counts for each option
    const votesResult = await query(
      'SELECT option_index FROM votes WHERE poll_id = $1',
      [pollId]
    )

    const votes = votesResult.rows

    // Count votes for each option
    const voteCounts = new Array(poll.options.length).fill(0)
    votes.forEach(vote => {
      if (vote.option_index >= 0 && vote.option_index < poll.options.length) {
        voteCounts[vote.option_index]++
      }
    })

    const totalVotes = votes.length

    // Create results with percentages
    const results = poll.options.map((option: string, index: number) => ({
      option,
      votes: voteCounts[index],
      percentage: totalVotes > 0 ? Math.round((voteCounts[index] / totalVotes) * 100) : 0
    }))

    const pollResults: PollResults = {
      poll,
      results,
      totalVotes
    }

    return NextResponse.json(pollResults)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
