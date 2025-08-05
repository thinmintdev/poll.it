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

  const getCottonColor = (index: number) => {
    const colors = [
      { 
        gradient: 'linear-gradient(135deg, #ff6b9d40, #ff6b9d)', 
        accent: '#ff6b9d',
        name: 'cotton-pink'
      },
      { 
        gradient: 'linear-gradient(135deg, #4facfe40, #4facfe)', 
        accent: '#4facfe',
        name: 'cotton-blue'
      },
      { 
        gradient: 'linear-gradient(135deg, #9f7aea40, #9f7aea)', 
        accent: '#9f7aea',
        name: 'cotton-purple'
      },
      { 
        gradient: 'linear-gradient(135deg, #00f5a040, #00f5a0)', 
        accent: '#00f5a0',
        name: 'cotton-mint'
      },
      { 
        gradient: 'linear-gradient(135deg, #ffa72640, #ffa726)', 
        accent: '#ffa726',
        name: 'cotton-peach'
      },
      { 
        gradient: 'linear-gradient(135deg, #e879f940, #e879f9)', 
        accent: '#e879f9',
        name: 'cotton-lavender'
      },
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="card group w-full relative z-10 hover-glow cursor-pointer transition-all duration-300">
      {/* Gradient Border Accent */}
      <div className="absolute -inset-0.5 bg-gradient-primary rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
      
      {/* Poll Header */}
      <div className="mb-6 relative z-10">
        <h3 className="text-xl font-bold mb-3 text-app-primary group-hover:text-gradient-primary transition-all duration-300 leading-tight">
          {poll.question}
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-cotton-mint">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">{totalVotes}</span>
              <span className="text-app-muted">vote{totalVotes !== 1 ? 's' : ''}</span>
            </div>
            <div className="w-1 h-1 bg-app-muted rounded-full"></div>
            <span className="text-app-muted">{formatDate(poll.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Bar Chart */}
      <div className="space-y-4 mb-6">
        {options.map((option, index) => {
          const voteCount = voteCounts[index] || 0
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
          const colorTheme = getCottonColor(index)
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-app-primary truncate pr-4 text-sm">
                  {option}
                </span>
                <div className="flex items-center space-x-3 text-sm">
                  <span 
                    className="font-bold"
                    style={{ color: colorTheme.accent }}
                  >
                    {voteCount}
                  </span>
                  <span className="text-app-muted font-medium">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-app-surface rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ 
                      width: `${percentage}%`,
                      background: colorTheme.gradient
                    }}
                  >
                    {percentage > 0 && (
                      <div 
                        className="absolute inset-0 rounded-full opacity-50"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${colorTheme.accent}60)`,
                          animation: 'shimmer 2s infinite'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-app-surface relative z-10">
        <Link
          href={`/poll/${poll.id}`}
          className="flex items-center space-x-2 text-app-muted hover:text-cotton-blue transition-all duration-200 group-hover:translate-x-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-medium text-sm">View Details</span>
        </Link>
        
        <Link
          href={`/poll/${poll.id}`}
          className="btn-gradient-border-sm hover:scale-105 transition-transform duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
          </svg>
          Vote Now
        </Link>
      </div>
      
      {/* Shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
