'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Poll {
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
}

interface PollManagementProps {
  polls: Poll[]
}

export default function PollManagement({ polls }: PollManagementProps) {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_votes'>('newest')
  const [filterType, setFilterType] = useState<'all' | 'text' | 'image'>('all')

  // Sort and filter polls
  const sortedAndFilteredPolls = polls
    .filter(poll => filterType === 'all' || poll.poll_type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'most_votes':
          return b.total_votes - a.total_votes
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const copyPollLink = async (pollId: string) => {
    const url = `${window.location.origin}/poll/${pollId}`
    try {
      await navigator.clipboard.writeText(url)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (polls.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 mx-auto text-app-muted mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-app-primary mb-2">No polls yet</h3>
          <p className="text-app-secondary mb-6">
            You haven&apos;t created any polls yet. Start by creating your first poll to engage with your audience.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Poll
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4">
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-app-primary mb-1">
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-field text-sm"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="most_votes">Most votes</option>
            </select>
          </div>
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-app-primary mb-1">
              Type
            </label>
            <select
              id="filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="input-field text-sm"
            >
              <option value="all">All types</option>
              <option value="text">Text polls</option>
              <option value="image">Image polls</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-app-secondary">
          {sortedAndFilteredPolls.length} of {polls.length} polls
        </div>
      </div>

      {/* Polls List */}
      <div className="space-y-4">
        <AnimatePresence>
          {sortedAndFilteredPolls.map((poll, index) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-app-primary line-clamp-2">
                      {poll.question}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      poll.poll_type === 'image'
                        ? 'bg-cotton-purple/20 text-cotton-purple'
                        : 'bg-cotton-blue/20 text-cotton-blue'
                    }`}>
                      {poll.poll_type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-app-secondary">
                    <span>{poll.options.length} options</span>
                    <span>{poll.total_votes} votes</span>
                    <span>{poll.unique_voters} unique voters</span>
                    <span>Created {formatDate(poll.created_at)}</span>
                    {poll.allow_multiple_selections && (
                      <span className="px-2 py-1 bg-cotton-mint/20 text-cotton-mint rounded">
                        Multiple choice
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/poll/${poll.id}`}
                    className="px-3 py-2 text-sm bg-app-surface border border-app rounded-md hover:bg-app-surface-light transition-colors text-app-primary"
                  >
                    View
                  </Link>
                  <Link
                    href={`/poll/${poll.id}/results`}
                    className="px-3 py-2 text-sm bg-cotton-blue text-white rounded-md hover:bg-cotton-blue/90 transition-colors"
                  >
                    Results
                  </Link>
                  <button
                    onClick={() => copyPollLink(poll.id)}
                    className="px-3 py-2 text-sm bg-cotton-purple text-white rounded-md hover:bg-cotton-purple/90 transition-colors"
                    title="Copy poll link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}