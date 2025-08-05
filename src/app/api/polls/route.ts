import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { CreatePollData } from '@/types/poll'

export async function POST(request: NextRequest) {
  try {
    const body: CreatePollData = await request.json()
    const { question, options, allowMultipleSelections = false, maxSelections = 1 } = body

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    if (allowMultipleSelections && maxSelections > options.length) {
      return NextResponse.json(
        { error: 'Max selections cannot exceed number of options' },
        { status: 400 }
      )
    }

    const pollId = uuidv4()
    
    const result = await query(
      'INSERT INTO polls (id, question, options, allow_multiple_selections, max_selections) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [pollId, question, JSON.stringify(options), allowMultipleSelections, maxSelections]
    )

    const poll = result.rows[0]

    if (!poll) {
      return NextResponse.json(
        { error: 'Failed to create poll' },
        { status: 500 }
      )
    }

    return NextResponse.json({ pollId: poll.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
