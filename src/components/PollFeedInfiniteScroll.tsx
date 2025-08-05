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
      <div className="text-center py-8">
        <div className="mb-4 text-secondary">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={refreshFeed}
          className="bg-accent hover:bg-highlight text-primary px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-2 text-secondary">
          <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading polls...</span>
        </div>
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-8 text-secondary">
        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="text-lg font-medium">No polls yet</p>
        <p className="text-sm">Create the first poll to get started!</p>
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
      {/* Header with refresh */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0 px-2">
        <h2 className="text-2xl font-bold text-app-primary">
          Recent Polls
        </h2>
        <button
          onClick={refreshFeed}
          className="p-2 rounded-full hover:bg-app-surface-hover text-app-muted hover:text-app-primary transition-colors duration-200"
          title="Refresh feed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Infinite Scroll Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-app-card to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-app-card to-transparent z-10 pointer-events-none"></div>
        
        <InfiniteScroll
          items={pollItems}
          width="100%"
          maxHeight="100%"
          itemMinHeight={180}
          isTilted={false}
          autoplay={true}
          autoplaySpeed={0.3}
          autoplayDirection="down"
          pauseOnHover={true}
          negativeMargin="0.5rem"
        />
      </div>
    </div>
  )
}