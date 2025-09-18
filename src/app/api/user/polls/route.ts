import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/constants/config'

/**
 * GET /api/user/polls - Get polls created by the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get user's polls with vote statistics
    const result = await query(
      `SELECT
        p.id,
        p.question,
        p.options,
        p.poll_type,
        p.allow_multiple_selections,
        p.max_selections,
        p.is_public,
        p.allow_anonymous_voting,
        p.created_at,
        p.updated_at,
        COUNT(v.id) as total_votes,
        COUNT(DISTINCT v.voter_ip) as unique_voters
       FROM polls p
       LEFT JOIN votes v ON p.id = v.poll_id
       WHERE p.user_id = $1
       GROUP BY p.id, p.question, p.options, p.poll_type, p.allow_multiple_selections,
                p.max_selections, p.is_public, p.allow_anonymous_voting, p.created_at, p.updated_at
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [session.user.id, limit, offset]
    )

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM polls WHERE user_id = $1',
      [session.user.id]
    )

    const polls = result.rows.map(row => ({
      ...row,
      options: JSON.parse(row.options),
      total_votes: parseInt(row.total_votes) || 0,
      unique_voters: parseInt(row.unique_voters) || 0
    }))

    const total = parseInt(countResult.rows[0]?.total) || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      polls,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}