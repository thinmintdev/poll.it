'use client'

import { motion } from 'framer-motion'

interface DashboardStatsProps {
  stats: {
    total_polls: number
    polls_last_30_days: number
    polls_last_7_days: number
    total_votes_received: number
    last_poll_created: string | null
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: 'Total Polls',
      value: stats.total_polls,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-cotton-blue to-cotton-purple'
    },
    {
      title: 'Total Votes',
      value: stats.total_votes_received,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      ),
      gradient: 'from-cotton-pink to-cotton-peach'
    },
    {
      title: 'This Month',
      value: stats.polls_last_30_days,
      suffix: 'polls',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-cotton-mint to-cotton-lavender'
    },
    {
      title: 'This Week',
      value: stats.polls_last_7_days,
      suffix: 'polls',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      gradient: 'from-cotton-yellow to-cotton-orange'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient} text-white mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-app-primary">
                {stat.value}
                {stat.suffix && <span className="text-sm text-app-secondary ml-1">{stat.suffix}</span>}
              </p>
              <p className="text-sm text-app-secondary">{stat.title}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}