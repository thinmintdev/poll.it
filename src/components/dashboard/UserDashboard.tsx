'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User } from 'next-auth'
import DashboardStats from './DashboardStats'
import PollManagement from './PollManagement'

interface UserDashboardProps {
  user: User
  polls: Array<{
    id: string
    question: string
    options: string[]
    poll_type: string
    allow_multiple_selections: boolean
    max_selections?: number
    created_at: string
    updated_at: string
    total_votes: number
    unique_voters: number
  }>
  stats: {
    total_polls: number
    polls_last_30_days: number
    polls_last_7_days: number
    total_votes_received: number
    last_poll_created: string | null
  }
}

export default function UserDashboard({ user, polls, stats }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'polls'>('overview')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-app-surface rounded-xl p-1 border border-app">
        <motion.button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white text-cotton-purple shadow-sm border border-cotton-purple/20'
              : 'text-app-secondary hover:text-app-primary'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0z" />
          </svg>
          Overview
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('polls')}
          className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'polls'
              ? 'bg-white text-cotton-purple shadow-sm border border-cotton-purple/20'
              : 'text-app-secondary hover:text-app-primary'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          My Polls ({polls.length})
        </motion.button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardStats stats={stats} />

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-app-primary mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/create"
                    className="block p-4 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <div>
                        <div className="font-medium">Create New Poll</div>
                        <div className="text-sm opacity-90">Start gathering opinions</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => setActiveTab('polls')}
                    className="w-full p-4 bg-app-surface border border-app rounded-lg hover:shadow-lg transition-all duration-300 text-left"
                  >
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <div>
                        <div className="font-medium text-app-primary">Manage Polls</div>
                        <div className="text-sm text-app-secondary">View and edit your polls</div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Recent Polls Preview */}
            {polls.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-app-primary">
                    Recent Polls
                  </h3>
                  <button
                    onClick={() => setActiveTab('polls')}
                    className="text-sm text-app-secondary hover:text-app-primary transition-colors"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {polls.slice(0, 3).map((poll) => (
                    <div
                      key={poll.id}
                      className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-app-primary truncate">
                          {poll.question}
                        </h4>
                        <p className="text-sm text-app-secondary">
                          {poll.total_votes} votes • {poll.unique_voters} voters
                        </p>
                      </div>
                      <Link
                        href={`/poll/${poll.id}`}
                        className="ml-4 px-3 py-1 text-sm bg-app-tertiary border border-app rounded hover:bg-app-surface transition-colors text-app-primary"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'polls' && (
          <PollManagement polls={polls} />
        )}
      </motion.div>
    </div>
  )
}