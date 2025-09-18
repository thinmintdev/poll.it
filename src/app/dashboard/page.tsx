import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'
import UserDashboard from '@/components/dashboard/UserDashboard'

async function getUserPolls(userId: string) {
  try {
    const result = await query(
      `SELECT
        p.id,
        p.question,
        p.options,
        p.poll_type,
        p.allow_multiple_selections,
        p.max_selections,
        p.created_at,
        p.updated_at,
        COUNT(v.id) as total_votes,
        COUNT(DISTINCT v.voter_ip) as unique_voters
       FROM polls p
       LEFT JOIN votes v ON p.id = v.poll_id
       WHERE p.user_id = $1
       GROUP BY p.id, p.question, p.options, p.poll_type, p.allow_multiple_selections, p.max_selections, p.created_at, p.updated_at
       ORDER BY p.created_at DESC`,
      [userId]
    )

    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      options: JSON.parse(row.options),
      poll_type: row.poll_type,
      allow_multiple_selections: row.allow_multiple_selections,
      max_selections: row.max_selections,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_votes: parseInt(row.total_votes) || 0,
      unique_voters: parseInt(row.unique_voters) || 0
    }))
  } catch (error) {
    console.error('Error fetching user polls:', error)
    return []
  }
}

async function getUserStats(userId: string) {
  try {
    const result = await query(
      `SELECT
        COUNT(p.id) as total_polls,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as polls_last_30_days,
        COUNT(CASE WHEN p.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as polls_last_7_days,
        COALESCE(SUM(vote_counts.total_votes), 0) as total_votes_received,
        MAX(p.created_at) as last_poll_created
       FROM polls p
       LEFT JOIN (
         SELECT poll_id, COUNT(*) as total_votes
         FROM votes
         GROUP BY poll_id
       ) vote_counts ON vote_counts.poll_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    )

    return {
      total_polls: parseInt(result.rows[0]?.total_polls) || 0,
      polls_last_30_days: parseInt(result.rows[0]?.polls_last_30_days) || 0,
      polls_last_7_days: parseInt(result.rows[0]?.polls_last_7_days) || 0,
      total_votes_received: parseInt(result.rows[0]?.total_votes_received) || 0,
      last_poll_created: result.rows[0]?.last_poll_created || null,
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return {
      total_polls: 0,
      polls_last_30_days: 0,
      polls_last_7_days: 0,
      total_votes_received: 0,
      last_poll_created: null,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const [userPolls, userStats] = await Promise.all([
    getUserPolls(session.user.id),
    getUserStats(session.user.id)
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-primary via-cotton-blue/5 to-cotton-purple/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-app-primary mb-2">
              Welcome back, {session.user.name || session.user.email}!
            </h1>
            <p className="text-app-secondary">
              Manage your polls and track their performance
            </p>
          </div>

          <UserDashboard
            user={session.user}
            polls={userPolls}
            stats={userStats}
          />
        </div>
      </div>
    </div>
  )
}