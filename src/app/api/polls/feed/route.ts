import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get polls with their vote counts
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
      LIMIT $1 OFFSET $2
    `

    const result = await query(pollsQuery, [limit, offset])

    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) as total FROM polls')
    const total = parseInt(countResult.rows[0].total)
    const hasMore = offset + limit < total

    return NextResponse.json({
      polls: result.rows,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    })

  } catch (error) {
    console.error('Error fetching polls feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch polls' },
      { status: 500 }
    )
  }
}
