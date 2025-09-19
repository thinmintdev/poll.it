'use client'

import { motion } from 'framer-motion'

interface PollStatsProps {
  pollId: string
  totalVotes: number
  views?: number
  shares?: number
  isLive?: boolean
  className?: string
}

export default function PollStats({
  totalVotes,
  views = 0,
  shares = 0,
  isLive = true,
  className = ''
}: PollStatsProps) {
  const statCards = [
    {
      title: 'Views',
      value: views,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-cotton-blue to-cotton-purple'
    },
    {
      title: 'Votes',
      value: totalVotes,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-cotton-pink to-cotton-peach'
    },
    {
      title: 'Shares',
      value: shares,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      ),
      gradient: 'from-cotton-mint to-cotton-lavender'
    },
    {
      title: 'Status',
      value: isLive ? 'Live' : 'Closed',
      icon: (
        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-cotton-mint animate-pulse' : 'bg-app-muted'}`}></div>
      ),
      gradient: isLive ? 'from-cotton-mint to-cotton-blue' : 'from-app-muted to-app-secondary',
      isStatus: true
    }
  ]

  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-app-secondary mb-1">{stat.title}</p>
              <p className="text-lg font-bold text-app-primary">
                {stat.isStatus ? stat.value : stat.value.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient} text-white flex items-center justify-center`}>
              {stat.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}