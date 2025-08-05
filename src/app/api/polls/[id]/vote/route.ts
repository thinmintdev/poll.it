import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { VoteData } from '@/types/poll'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const body: VoteData = await request.json()
    const { optionIndex } = body

    // Handle both single and multiple selections
    const optionIndices = Array.isArray(optionIndex) ? optionIndex : [optionIndex]

    if (optionIndices.length === 0 || optionIndices.some(idx => idx === undefined || idx < 0)) {
      return NextResponse.json(
        { error: 'Valid option index(es) required' },
        { status: 400 }
      )
    }

    // Get voter IP
    const forwarded = request.headers.get('x-forwarded-for')
    const voterIp = forwarded ? forwarded.split(',')[0] : 
                   request.headers.get('x-real-ip') || 
                   'unknown'

    // Verify poll exists and get poll settings
    const pollResult = await query(
      'SELECT options, allow_multiple_selections, max_selections FROM polls WHERE id = $1',
      [pollId]
    )

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    const poll = pollResult.rows[0]
    let options = poll.options
    if (typeof options === 'string') {
      options = JSON.parse(options)
    }

    const allowMultiple = poll.allow_multiple_selections || false
    const maxSelections = poll.max_selections || 1

    // Validate selection rules
    if (!allowMultiple && optionIndices.length > 1) {
      return NextResponse.json(
        { error: 'This poll only allows single selection' },
        { status: 400 }
      )
    }

    if (allowMultiple && optionIndices.length > maxSelections) {
      return NextResponse.json(
        { error: `Maximum ${maxSelections} selections allowed` },
        { status: 400 }
      )
    }

    if (optionIndices.some(idx => idx >= options.length)) {
      return NextResponse.json(
        { error: 'Invalid option index' },
        { status: 400 }
      )
    }

    // Check for duplicate selections
    if (new Set(optionIndices).size !== optionIndices.length) {
      return NextResponse.json(
        { error: 'Duplicate selections not allowed' },
        { status: 400 }
      )
    }

    // Check if this IP has already voted on this poll (for single selection polls)
    // For multiple selection polls, check if they've already voted for these specific options
    if (!allowMultiple) {
      const existingVoteResult = await query(
        'SELECT id FROM votes WHERE poll_id = $1 AND voter_ip = $2',
        [pollId, voterIp]
      )

      if (existingVoteResult.rows.length > 0) {
        return NextResponse.json(
          { error: 'You have already voted on this poll' },
          { status: 409 }
        )
      }
    } else {
      // For multiple selection polls, check if they've already voted for any of these options
      const existingVotesResult = await query(
        'SELECT option_index FROM votes WHERE poll_id = $1 AND voter_ip = $2',
        [pollId, voterIp]
      )

      const existingIndices = existingVotesResult.rows.map(row => row.option_index)
      const alreadyVoted = optionIndices.some(idx => existingIndices.includes(idx))

      if (alreadyVoted) {
        return NextResponse.json(
          { error: 'You have already voted for one or more of these options' },
          { status: 409 }
        )
      }

      // Check if adding these votes would exceed max selections
      const totalSelections = existingIndices.length + optionIndices.length
      if (totalSelections > maxSelections) {
        return NextResponse.json(
          { error: `Adding these selections would exceed the maximum of ${maxSelections} selections` },
          { status: 400 }
        )
      }
    }

    // Record the votes
    for (const idx of optionIndices) {
      await query(
        'INSERT INTO votes (id, poll_id, option_index, voter_ip) VALUES ($1, $2, $3, $4)',
        [uuidv4(), pollId, idx, voterIp]
      )
    }

    // Get updated results and broadcast to all clients in the poll room
    const resultsQuery = await query(`
      SELECT 
        option_index,
        COUNT(*) as votes
      FROM votes 
      WHERE poll_id = $1 
      GROUP BY option_index
      ORDER BY option_index
    `, [pollId])

    const totalVotes = resultsQuery.rows.reduce((sum, row) => sum + parseInt(row.votes), 0)
    const results = options.map((_: string, index: number) => {
      const voteData = resultsQuery.rows.find(row => row.option_index === index)
      const votes = voteData ? parseInt(voteData.votes) : 0
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
      return { votes, percentage }
    })

    // Broadcast updated results to all clients in the poll room
    try {
      // Access the socket.io instance from the global store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const io = (global as any).io
      if (io) {
        io.to(`poll-${pollId}`).emit('pollResults', {
          totalVotes,
          results
        })
        console.log(`Broadcasted poll results to poll-${pollId} room`)
      } else {
        console.log('Socket.IO instance not found - results will not be broadcast in real-time')
      }
    } catch (error) {
      console.error('Failed to broadcast poll results:', error)
      // Don't fail the vote if broadcast fails
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
