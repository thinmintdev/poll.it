'use client'
import Link from 'next/link'
import PollChart from '@/components/PollChart'
import ShareModal from '@/components/ShareModal'
import ImagePollVoting from '@/components/ImagePollVoting'
import { Poll } from '@/types/poll'
import { useEffect, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import io from 'socket.io-client'

interface Result {
  votes: number
  percentage: number
}

interface Results {
  totalVotes: number
  results: Result[]
}

interface PollPageClientProps {
  id: string
}

export default function PollPageClient({ id }: PollPageClientProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [chartType, setChartType] = useState<'doughnut' | 'bar'>('doughnut')
  const { trackVote, trackShare } = useAnalytics()

  useEffect(() => {
    const fetchPollAndResults = async () => {
      try {
        const [pollRes, resultsRes] = await Promise.all([
          fetch(`/api/polls/${id}`),
          fetch(`/api/polls/${id}/results`),
        ])

        if (!pollRes.ok) {
          const errorData = await pollRes.json()
          throw new Error(errorData.error || `HTTP error! status: ${pollRes.status}`)
        }
        const pollData = await pollRes.json()
        setPoll(pollData)

        if (resultsRes.ok) {
          const resultsData = await resultsRes.json()
          setResults(resultsData)
        }
        // Don't throw for results, it might not have any yet
      } catch (err) {
        if (err instanceof Error) {
          console.error('Fetch error:', err)
          setError(err.message)
        } else {
          setError('An unknown error occurred while fetching data.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPollAndResults()

    const socket = io({ path: '/api/socket' })

    socket.on('connect', () => {
      console.log('Connected to socket server')
      socket.emit('join-poll', id)
    })

    socket.on('pollResults', (newResults: Results) => {
      setResults(newResults)
    })

    socket.on('error', (errorMessage: string) => {
      setError(errorMessage)
    })

    return () => {
      socket.disconnect()
    }
  }, [id])

  const handleVote = async () => {
    const isMultiple = poll?.allow_multiple_selections
    const optionsToVote = isMultiple ? selectedOptions : (selectedOption !== null ? [selectedOption] : [])
    
    if (optionsToVote.length === 0) return
    
    setVoting(true)
    setError(null)
    try {
      const response = await fetch(`/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          optionIndex: poll?.allow_multiple_selections ? optionsToVote : optionsToVote[0] 
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to vote')
      }
      
      // Track vote for analytics
      trackVote(id)
      
      setHasVoted(true)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setVoting(false)
    }
  }

  const handleOptionSelect = (index: number) => {
    if (poll?.allow_multiple_selections) {
      const maxSelections = poll.max_selections || 1
      setSelectedOptions(prev => {
        if (prev.includes(index)) {
          // Remove if already selected
          return prev.filter(i => i !== index)
        } else if (prev.length < maxSelections) {
          // Add if under limit
          return [...prev, index]
        }
        // At limit, don't add
        return prev
      })
    } else {
      // For single selection, update both states to maintain consistency
      setSelectedOption(index)
      setSelectedOptions([index])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-app-secondary">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg">Loading poll...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center card max-w-md">
          <div className="text-red-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-app-primary mb-4">Poll Not Found</h2>
          <p className="text-app-secondary mb-6">
            {error || "The poll you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/" className="btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    )
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-app-bg text-app-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-1 h-8 bg-gradient-primary rounded-full"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary leading-tight">
              {poll?.question}
            </h1>
            <div className="flex items-center space-x-1 text-cotton-mint text-sm">
            </div>
          </div>
          <div className="flex items-center justify-center space-x-6 text-app-secondary">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{results?.totalVotes || 0} vote{(results?.totalVotes || 0) !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2 text-cotton-mint">
              <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse"></div>
              <span>Live Results</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Voting Phase or Results */}
          <div className={`card ${poll?.poll_type === 'image' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-app-primary text-xl font-bold">{hasVoted ? 'Results' : 'Cast Your Vote'}</h2>
                <p className="text-app-muted text-sm">by a guest • {hasVoted ? 'just now' : '4 minutes ago'}</p>
              </div>
              <button 
                onClick={() => setShowShareModal(true)}
                className="relative p-2 rounded-lg transition-all duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, #ff6b9d40, #4facfe40)',
                  border: '1px solid transparent',
                  backgroundClip: 'padding-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 107, 157, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <svg className="w-5 h-5 text-app-primary group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
            
            {poll?.poll_type === 'image' ? (
              <ImagePollVoting
                poll={poll}
                results={results}
                hasVoted={hasVoted}
                voting={voting}
                selectedOptions={selectedOptions}
                onOptionSelect={handleOptionSelect}
                onVote={handleVote}
                onBackToPoll={() => setHasVoted(false)}
                onViewResults={() => setHasVoted(true)}
                error={error}
              />
            ) : (
              <>
                {!hasVoted ? (
                  <div>
                    <div className="space-y-4 mb-6">
                      {poll?.options.map((option, index) => {
                        const isSelected = poll?.allow_multiple_selections 
                          ? selectedOptions.includes(index)
                          : selectedOption === index
                        
                        return (
                          <label
                            key={index}
                            className={`w-full cursor-pointer ${isSelected ? 'btn-gradient-border text-cotton-purple' : 'btn-secondary'}`}
                          >
                            <input
                              type={poll?.allow_multiple_selections ? "checkbox" : "radio"}
                              name="poll-option"
                              value={index}
                              checked={isSelected}
                              onChange={() => handleOptionSelect(index)}
                              className="sr-only"
                            />
                            <span className="text-center w-full flex items-center justify-center gap-2">
                              {poll?.allow_multiple_selections && (
                                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                                  isSelected ? 'bg-cotton-purple border-cotton-purple' : 'border-app-muted'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              )}
                              {option}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    
                    {poll?.allow_multiple_selections && (
                      <div className="mb-4 text-sm text-app-muted text-center">
                        {selectedOptions.length === 0 
                          ? `Select up to ${poll.max_selections || 1} option${(poll.max_selections || 1) > 1 ? 's' : ''}`
                          : `${selectedOptions.length} of ${poll.max_selections || 1} selected`
                        }
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleVote}
                        disabled={
                          (poll?.allow_multiple_selections ? selectedOptions.length === 0 : selectedOption === null) || 
                          voting
                        }
                        className="btn-primary w-full"
                      >
                        {voting ? 'Voting...' : 'Vote'}
                      </button>
                      
                      <button 
                        className="btn-secondary" 
                        onClick={() => setHasVoted(true)}
                      >
                        Results
                      </button>
                    </div>
                    
                    {error && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="space-y-4 mb-6">
                      {poll?.options.map((option, index) => {
                        const result = results?.results[index]
                        const percent = result?.percentage || 0
                        const voteCount = result?.votes || 0
                        const isSelected = poll?.allow_multiple_selections 
                          ? selectedOptions.includes(index)
                          : selectedOption === index
                        const colorTheme = getCottonColor(index)
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`font-semibold truncate pr-4 text-sm ${isSelected ? 'text-cotton-purple' : 'text-app-primary'}`}>
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
                                  {percent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <div className="w-full bg-app-surface rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700 ease-out relative"
                                  style={{ 
                                    width: `${percent}%`,
                                    background: colorTheme.gradient
                                  }}
                                >
                                  {percent > 0 && (
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
                    
                    <p className="text-app-muted text-sm mb-6 text-center">Total votes: {results?.totalVotes || 0}</p>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        className="btn-secondary w-full" 
                        onClick={() => setHasVoted(false)}
                      >
                        Back to Poll
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="btn-clear"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        Share
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column: Chart and Feed (only for text polls) */}
          {poll?.poll_type !== 'image' && (
            <div className="space-y-8">
              {/* Chart Panel */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-app-primary font-semibold text-lg">Chart</span>
                  </div>
                  <div className="flex justify-center gap-2 bg-app-surface p-1 rounded-lg">
                    <button
                      onClick={() => setChartType('doughnut')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartType === 'doughnut' ? 'bg-app-tertiary text-app-primary' : 'text-app-secondary hover:text-app-primary'
                      }`}
                    >
                      Pie
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartType === 'bar' ? 'bg-app-tertiary text-app-primary' : 'text-app-secondary hover:text-app-primary'
                      }`}
                    >
                      Bar
                    </button>
                  </div>
                </div>
                <div className="h-[320px]">
                  <PollChart
                    results={poll?.options.map((option, index) => ({
                      option,
                      votes: results?.results[index]?.votes || 0,
                      percentage: results?.results[index]?.percentage || 0
                    })) || []}
                    type={chartType}
                  />
                </div>
              </div>
              
              {/* Comments/Feed Panel */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 text-app-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-app-primary font-semibold text-lg">Feed</span>
                </div>
                <p className="text-app-muted text-sm">Comments are disabled for this poll.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Share Modal */}
        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          pollUrl={currentUrl}
          pollTitle={poll?.question || 'Poll'}
          pollId={id}
          onShare={(method) => trackShare(method, id)}
        />
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