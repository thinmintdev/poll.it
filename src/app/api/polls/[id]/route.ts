import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const result = await query('SELECT * FROM polls WHERE id = $1', [id])
    const poll = result.rows[0]

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    // Check if poll is private and user is not the owner
    if (!poll.is_public && poll.user_id !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Access denied. This poll is private.' },
        { status: 403 }
      )
    }

    // Parse options if they're stored as JSON string
    if (typeof poll.options === 'string') {
      poll.options = JSON.parse(poll.options)
    }

    // If it's an image poll, fetch image options
    if (poll.poll_type === 'image') {
      const imageOptionsResult = await query(
        'SELECT * FROM image_options WHERE poll_id = $1 ORDER BY order_index ASC',
        [id]
      )
      poll.image_options = imageOptionsResult.rows
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error('Error fetching poll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
