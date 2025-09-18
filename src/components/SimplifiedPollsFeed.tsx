'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface SimplifiedPollsFeedProps {
  className?: string
  maxHeight?: string
  showHeader?: boolean
  enableInfiniteScroll?: boolean
  itemsPerPage?: number
}

export default function SimplifiedPollsFeed({
  className = '',
  maxHeight = 'calc(100vh - 200px)',
  showHeader = true,
  enableInfiniteScroll = true,
  itemsPerPage = 20
}: SimplifiedPollsFeedProps) {
  const [polls, setPolls] = useState<PollData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: itemsPerPage,
    total: 0,
    hasMore: true
  })

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const [userInteracting, setUserInteracting] = useState(false)

  const fetchPolls = useCallback(async (page: number, isInitial = false) => {
    if (loading) return

    setLoading(true)
    if (isInitial) {
      setError(null)
    }

    try {
      const response = await fetch(`/api/polls/feed?page=${page}&limit=${pagination.limit}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch polls: ${response.status}`)
      }

      const data = await response.json()

      if (isInitial) {
        setPolls(data.polls || [])
      } else {
        setPolls(prev => [...prev, ...(data.polls || [])])
      }

      setPagination(data.pagination || {
        page,
        limit: pagination.limit,
        total: data.polls?.length || 0,
        hasMore: false
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load polls'
      setError(errorMessage)
      console.error('Error fetching polls:', err)
    } finally {
      setLoading(false)
    }
  }, [loading, pagination.limit])

  // Initial load
  useEffect(() => {
    fetchPolls(1, true)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadingRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (
          target.isIntersecting &&
          pagination.hasMore &&
          !loading &&
          !error
        ) {
          fetchPolls(pagination.page + 1)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px'
      }
    )

    const currentTarget = loadingRef.current
    observer.observe(currentTarget)

    return () => {
      observer.unobserve(currentTarget)
    }
  }, [fetchPolls, pagination.hasMore, pagination.page, loading, error, enableInfiniteScroll])

  const handleRefresh = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }))
    setPolls([])
    setError(null)

    // Add small delay to prevent rapid refresh
    retryTimeoutRef.current = setTimeout(() => {
      fetchPolls(1, true)
    }, 300)
  }, [fetchPolls])

  const handleRetry = useCallback(() => {
    setError(null)
    fetchPolls(pagination.page + 1)
  }, [fetchPolls, pagination.page])

  // Autoscroll functionality
  useEffect(() => {
    if (!enableInfiniteScroll || polls.length === 0 || userInteracting) return

    const startAutoScroll = () => {
      autoScrollRef.current = setTimeout(() => {
        if (scrollContainerRef.current && !userInteracting) {
          const container = scrollContainerRef.current
          const scrollAmount = container.scrollHeight * 0.05 // Scroll 10% of content height

          container.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          })

          // If we've reached the bottom, scroll back to top
          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            setTimeout(() => {
              container.scrollTo({ top: 0, behavior: 'smooth' })
            }, 2000)
          }

          startAutoScroll() // Continue autoscroll
        }
      }, 1000) // Scroll every 3 seconds
    }

    const timer = setTimeout(startAutoScroll, 5000) // Start after 5 seconds

    return () => {
      clearTimeout(timer)
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current)
      }
    }
  }, [polls.length, userInteracting, enableInfiniteScroll])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (autoScrollRef.current) {
        clearTimeout(autoScrollRef.current)
      }
    }
  }, [])

  // Error state for initial load
  if (error && polls.length === 0) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center space-x-3 mt-14 mb-6">
            <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
            <h2 className="text-3xl font-bold text-gradient-primary">
              Recent Polls
            </h2>
          </div>
        )}
        <div className="card">
          <motion.div
            className="flex items-center justify-center min-h-[300px] text-cotton-pink"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center max-w-md">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium mb-2 text-app-primary">Failed to load polls</p>
              <p className="text-sm text-app-muted mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Try Again'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex justify-between items-center mt-14 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
            <h2 className="text-3xl font-bold text-gradient-primary">
              Recent Polls
            </h2>
          </div>
          <button
            onClick={handleRefresh}
            className="group relative p-3 rounded-xl glass-card hover:border-cotton-blue transition-all duration-300 hover:scale-105"
            title="Refresh feed"
            disabled={loading}
          >
            <svg
              className={`w-5 h-5 text-app-muted group-hover:text-cotton-blue transition-all duration-200 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </button>
        </div>
      )}

      {/* Loading state for initial load */}
      {polls.length === 0 && loading && (
        <motion.div
          className="flex items-center justify-center min-h-[400px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-cotton-blue border-t-transparent animate-spin mx-auto mb-4"></div>
              <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-cotton-pink border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-app-secondary text-lg font-medium">Loading polls...</p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {polls.length === 0 && !loading && !error && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
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
        </motion.div>
      )}

      {/* Polls grid - Natural height handling */}
      {polls.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="space-y-6 overflow-y-auto relative scrollbar-hide"
          style={{ maxHeight }}
          onMouseEnter={() => setUserInteracting(true)}
          onMouseLeave={() => setUserInteracting(false)}
          onTouchStart={() => setUserInteracting(true)}
          onTouchEnd={() => setTimeout(() => setUserInteracting(false), 2000)}
          onScroll={() => {
            setUserInteracting(true)
            // Reset user interaction after 3 seconds of no scrolling
            if (autoScrollRef.current) clearTimeout(autoScrollRef.current)
            autoScrollRef.current = setTimeout(() => setUserInteracting(false), 3000)
          }}
        >
          {/* Enhanced fade gradients */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-app-primary via-app-primary/70 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-app-primary via-app-primary/70 to-transparent z-10 pointer-events-none"></div>
          <AnimatePresence mode="popLayout">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index < 10 ? index * 0.1 : 0 // Only animate first 10 items
                }}
                layout
              >
                <PollCard poll={poll} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Infinite scroll loading indicator */}
          {enableInfiniteScroll && (
            <div ref={loadingRef} className="py-4">
              {loading && (
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cotton-blue"></div>
                </motion.div>
              )}

              {/* Error indicator for infinite scroll */}
              {error && polls.length > 0 && (
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-red-500 text-sm mb-2">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="btn-secondary text-sm"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Try Again'}
                  </button>
                </motion.div>
              )}

              {/* End of results indicator */}
              {!pagination.hasMore && !loading && !error && (
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-center space-x-2 text-app-muted">
                    <div className="w-8 h-px bg-app-surface"></div>
                    <span className="text-sm font-medium">You&apos;ve reached the end</span>
                    <div className="w-8 h-px bg-app-surface"></div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}