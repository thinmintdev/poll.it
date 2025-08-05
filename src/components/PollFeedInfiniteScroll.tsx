'use client'

import { useState, useEffect } from 'react'
import PollCard from './PollCard'
import InfiniteScroll from './InfiniteScroll'

interface VoteCount {
  index: number
  count: number
}

interface PollData {
  id: string
  question: string
  options: string
  created_at: string
  vote_counts: VoteCount[] | null
}

interface PaginationData {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

interface FeedResponse {
  polls: PollData[]
  pagination: PaginationData
}

export default function PollFeedInfiniteScroll() {
  const [polls, setPolls] = useState<PollData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPolls = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all polls for infinite scroll
      const response = await fetch(`/api/polls/feed?page=1&limit=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch polls')
      }
      
      const data: FeedResponse = await response.json()
      setPolls(data.polls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load polls')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  // Refresh function
  const refreshFeed = () => {
    fetchPolls()
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <div className="mb-6 text-cotton-pink">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-app-secondary text-sm">{error}</p>
          </div>
          <button
            onClick={refreshFeed}
            className="btn-primary w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center space-x-3 text-app-secondary">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-2 border-cotton-blue border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-cotton-pink border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <span className="text-lg font-medium">Loading polls...</span>
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <div className="text-cotton-mint mb-6">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-app-primary mb-2">No polls yet</h3>
          <p className="text-app-muted mb-6">Create the first poll to get started!</p>
          <a href="/create" className="btn-gradient-border">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Poll
          </a>
        </div>
      </div>
    )
  }

  // Create items for infinite scroll
  const pollItems = polls.map(poll => ({
    content: <PollCard poll={poll} />,
    id: poll.id
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Enhanced Header with Gradient Text */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0 px-2">
        <div className="flex items-center space-x-3">
          <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
          <h2 className="text-3xl font-bold text-gradient-primary">
            Recent Polls
          </h2>
          <div className="flex items-center space-x-1 text-cotton-mint text-sm">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <span className="font-medium">Live</span>
          </div>
        </div>
        <button
          onClick={refreshFeed}
          className="group relative p-3 rounded-xl glass-card hover:border-cotton-blue transition-all duration-300 hover:scale-105"
          title="Refresh feed"
        >
          <svg className="w-5 h-5 text-app-muted group-hover:text-cotton-blue transition-colors duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Clean Infinite Scroll Container */}
      <div className="flex-1 overflow-hidden relative">
        {/* Refined Gradient Masks */}
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-app-bg via-app-bg/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-app-bg via-app-bg/80 to-transparent z-20 pointer-events-none"></div>
        
        <InfiniteScroll
          items={pollItems}
          width="100%"
          maxHeight="75%"
          itemMinHeight={220}
          isTilted={false}
          autoplay={true}
          autoplaySpeed={0.25}
          autoplayDirection="down"
          pauseOnHover={true}
          negativeMargin="-19rem"
        />
      </div>
    </div>
  )
}