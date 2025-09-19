import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'
import { PollResults, Poll } from '@/types/poll'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const session = await getServerSession(authOptions)

    // Get client IP for vote checking
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Get poll data
    const pollResult = await query<Poll>('SELECT * FROM polls WHERE id = $1', [pollId])

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    const poll = pollResult.rows[0]

    // Check hide results logic
    if (poll.hide_results) {
      const isOwner = session?.user?.id && poll.user_id === session.user.id

      if (poll.hide_results === 'entirely' && !isOwner) {
        // Only poll creator can see results
        return NextResponse.json(
          { error: 'Results are hidden for this poll' },
          { status: 403 }
        )
      }

      if (poll.hide_results === 'until_vote' && !isOwner) {
        // Check if user has voted
        const hasVoted = await query(
          'SELECT 1 FROM votes WHERE poll_id = $1 AND voter_ip = $2 LIMIT 1',
          [pollId, clientIp]
        )

        if (hasVoted.rows.length === 0) {
          // User hasn't voted yet, hide results
          return NextResponse.json(
            { error: 'You must vote before seeing results' },
            { status: 403 }
          )
        }
      }
    }
    
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
