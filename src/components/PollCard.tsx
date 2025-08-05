'use client'

import Link from 'next/link'

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

interface PollCardProps {
  poll: PollData
}

export default function PollCard({ poll }: PollCardProps) {
  // Parse options from JSON string
  let options: string[] = []
  let voteCounts: number[] = []
  let totalVotes = 0

  try {
    options = JSON.parse(poll.options)
    voteCounts = new Array(options.length).fill(0)
    
    // Fill in the vote counts
    if (poll.vote_counts) {
      poll.vote_counts.forEach((voteCount) => {
        if (voteCount.index < voteCounts.length) {
          voteCounts[voteCount.index] = voteCount.count
        }
      })
    }
    
    totalVotes = voteCounts.reduce((sum, count) => sum + count, 0)
  } catch (error) {
    console.error('Error parsing poll options:', error)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else {
      return 'Just now'
    }
  }

  const getBarColor = (index: number) => {
    const colors = [
      '#86efac', // green-300
      '#fde047', // yellow-300
      '#f9a8d4', // pink-300
      '#a5b4fc', // indigo-300
      '#6ee7b7', // teal-300
      '#fca5a5', // red-300
      '#c4b5fd', // violet-300
      '#93c5fd', // blue-300
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="card group w-full relative z-10">
      {/* Poll Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-app-primary group-hover:text-white transition-colors duration-200">
          {poll.question}
        </h3>
        <div className="flex items-center justify-between text-sm text-app-secondary">
          <span>{totalVotes} votes</span>
          <span>{formatDate(poll.created_at)}</span>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3 mb-4">
        {options.map((option, index) => {
          const voteCount = voteCounts[index] || 0
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium truncate pr-2 text-app-primary">
                  {option}
                </span>
                <div className="flex items-center space-x-2 text-app-secondary">
                  <span className="font-bold">{voteCount}</span>
                  <span className="text-xs">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
              
              <div className="w-full bg-app-surface rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${percentage}%`,
                    background: `linear-gradient(to right, ${getBarColor(index)}40, ${getBarColor(index)})`
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t border-app-surface">
        <Link
          href={`/poll/${poll.id}`}
          className="font-medium text-sm flex items-center space-x-1 text-app-secondary hover:text-white transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span>View Details</span>
        </Link>
        
        <Link
          href={`/poll/${poll.id}`}
          className="btn-secondary text-xs"
        >
          Vote Now
        </Link>
      </div>
    </div>
  )
}
