'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import PollCard from './PollCard'

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export default function PollFeed() {
  const [polls, setPolls] = useState<PollData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true
  })

  const observerTarget = useRef<HTMLDivElement>(null)

  const fetchPolls = useCallback(async (page: number, isInitial = false) => {
    if (loading) return
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/polls/feed?page=${page}&limit=${pagination.limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch polls')
      }

      const data = await response.json()
      
      if (isInitial) {
        setPolls(data.polls)
      } else {
        setPolls(prev => [...prev, ...data.polls])
      }
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [loading, pagination.limit])

  // Initial load
  useEffect(() => {
    fetchPolls(1, true)
  }, [fetchPolls])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && pagination.hasMore && !loading) {
          fetchPolls(pagination.page + 1)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [fetchPolls, pagination.hasMore, pagination.page, loading])

  if (error && polls.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Polls
        </h2>
        <div className="flex items-center justify-center h-64 text-red-500">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-medium">Failed to load polls</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => fetchPolls(1, true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Recent Polls
      </h2>
      
      {polls.length === 0 && loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading polls...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
          
          {/* Loading indicator for infinite scroll */}
          {loading && polls.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {/* Error indicator for infinite scroll */}
          {error && polls.length > 0 && (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button 
                onClick={() => fetchPolls(pagination.page + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* End of results indicator */}
          {!pagination.hasMore && polls.length > 0 && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">You&apos;ve reached the end of the feed</p>
            </div>
          )}
          
          {/* Intersection observer target */}
          <div ref={observerTarget} className="h-4" />
        </div>
      )}
    </div>
  )
}
