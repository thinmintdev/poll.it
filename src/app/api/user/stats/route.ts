import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'
import { HTTP_STATUS, ERROR_MESSAGES } from '@/constants/config'

/**
 * GET /api/user/stats - Get statistics for the authenticated user
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

    // Get comprehensive user statistics
    const result = await query(
      `SELECT
        COUNT(p.id) as total_polls,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as polls_last_30_days,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as polls_last_7_days,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE THEN 1 END) as polls_today,
        COALESCE(SUM(vote_counts.total_votes), 0) as total_votes_received,
        COALESCE(SUM(vote_counts.unique_voters), 0) as total_unique_voters,
        MAX(p.created_at) as last_poll_created,
        AVG(vote_counts.total_votes) as avg_votes_per_poll
       FROM polls p
       LEFT JOIN (
         SELECT
           poll_id,
           COUNT(*) as total_votes,
           COUNT(DISTINCT voter_ip) as unique_voters
         FROM votes
         GROUP BY poll_id
       ) vote_counts ON vote_counts.poll_id = p.id
       WHERE p.user_id = $1`,
      [session.user.id]
    )

    const stats = result.rows[0]

    // Get poll type breakdown
    const typeBreakdownResult = await query(
      `SELECT
        poll_type,
        COUNT(*) as count
       FROM polls
       WHERE user_id = $1
       GROUP BY poll_type`,
      [session.user.id]
    )

    const pollTypeBreakdown = typeBreakdownResult.rows.reduce((acc, row) => {
      acc[row.poll_type] = parseInt(row.count)
      return acc
    }, {} as Record<string, number>)

    // Get recent activity (last 7 days)
    const activityResult = await query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as polls_created
       FROM polls
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [session.user.id]
    )

    const recentActivity = activityResult.rows.map(row => ({
      date: row.date,
      polls_created: parseInt(row.polls_created)
    }))

    return NextResponse.json({
      stats: {
        total_polls: parseInt(stats.total_polls) || 0,
        polls_last_30_days: parseInt(stats.polls_last_30_days) || 0,
        polls_last_7_days: parseInt(stats.polls_last_7_days) || 0,
        polls_today: parseInt(stats.polls_today) || 0,
        total_votes_received: parseInt(stats.total_votes_received) || 0,
        total_unique_voters: parseInt(stats.total_unique_voters) || 0,
        avg_votes_per_poll: parseFloat(stats.avg_votes_per_poll) || 0,
        last_poll_created: stats.last_poll_created,
        poll_type_breakdown: {
          text: pollTypeBreakdown.text || 0,
          image: pollTypeBreakdown.image || 0
        },
        recent_activity: recentActivity
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}