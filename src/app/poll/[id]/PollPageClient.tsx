'use client'
import Link from 'next/link'
import PollChart from '@/components/PollChart'
import PollStats from '@/components/PollStats'
import ShareModal from '@/components/ShareModal'
import ImagePollVoting from '@/components/ImagePollVoting'
import Comments from '@/components/Comments'
import PollAnalyticsDashboard from '@/components/PollAnalyticsDashboard'
import { Poll, PollResults } from '@/types/poll'
import { useEffect, useState } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics'
import io, { Socket } from 'socket.io-client'

interface PollPageClientProps {
  id: string
  forceResults?: boolean
}

export default function PollPageClient({ id, forceResults = false }: PollPageClientProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [results, setResults] = useState<PollResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [actuallyVoted, setActuallyVoted] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [chartType, setChartType] = useState<'doughnut' | 'bar'>('doughnut')
  const [lastResultsFetch, setLastResultsFetch] = useState<number>(0)
  const { trackVote, trackShare } = useAnalytics()

  // Initialize advanced analytics tracking
  const analytics = useAdvancedAnalytics({
    pollId: id,
    trackScrollDepth: true,
    trackTimeOnPage: true,
    trackHover: true,
    trackClicks: true
  });

  useEffect(() => {
    const fetchPollAndResults = async () => {
      try {
        const [pollRes, resultsRes, voteStatusRes] = await Promise.all([
          fetch(`/api/polls/${id}`),
          fetch(`/api/polls/${id}/results`),
          fetch(`/api/polls/${id}/vote-status`),
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

        if (voteStatusRes.ok) {
          const voteStatusData = await voteStatusRes.json()
          setHasVoted(voteStatusData.hasVoted)
          if (voteStatusData.hasVoted) {
            setActuallyVoted(true)
            if (pollData?.allow_multiple_selections) {
              setSelectedOptions(voteStatusData.votedOptions || [])
            } else {
              setSelectedOption(voteStatusData.votedOptions?.[0] ?? null)
            }
          }
        }

        setLastResultsFetch(Date.now())
      } catch (err) {
        console.error('Error fetching poll data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load poll')
      } finally {
        setLoading(false)
      }
    }

    fetchPollAndResults()
  }, [id])

  // Socket.IO for real-time updates
  useEffect(() => {
    let socket: Socket | null = null

    const connectSocket = async () => {
      try {
        await fetch('/api/socket')
        socket = io({
          path: '/api/socket',
          addTrailingSlash: false,
        })

        socket.on('connect', () => {
          console.log('Connected to socket server')
          socket?.emit('join-poll', id)
        })

        socket.on('pollResults', (data) => {
          if (data && typeof data.totalVotes === 'number' && Array.isArray(data.results)) {
            setResults(prevResults => {
              if (!prevResults?.poll) return prevResults
              return {
                ...prevResults,
                results: prevResults.poll.options.map((option, index) => ({
                  option,
                  votes: data.results[index]?.votes || 0,
                  percentage: data.results[index]?.percentage || 0
                })),
                totalVotes: data.totalVotes
              }
            })
            setLastResultsFetch(Date.now())
          }
        })

        socket.on('pollVoteReceived', (data) => {
          if (data?.hideResults) {
            console.log('Vote received but results are hidden')
          }
        })

        socket.on('disconnect', () => {
          console.log('Disconnected from socket server')
        })

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error)
        })

      } catch (error) {
        console.error('Failed to initialize socket connection:', error)
      }
    }

    connectSocket()

    return () => {
      if (socket) {
        socket.emit('leave-poll', id)
        socket.disconnect()
      }
    }
  }, [id])

  const handleVote = async () => {
    if (!poll) return

    if (poll.allow_multiple_selections && selectedOptions.length === 0) {
      alert('Please select at least one option')
      return
    }

    if (!poll.allow_multiple_selections && selectedOption === null) {
      alert('Please select an option')
      return
    }

    setVoting(true)

    try {
      const sessionAnalytics = analytics.getSessionAnalytics();
      const optionIndex = poll.allow_multiple_selections ? selectedOptions : selectedOption

      const response = await fetch(`/api/polls/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': analytics.sessionId,
          'x-time-to-vote': sessionAnalytics.timeOnPage.toString()
        },
        body: JSON.stringify({ optionIndex }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setHasVoted(true)
        setActuallyVoted(true)

        // Track vote analytics with behavioral context
        const primaryOptionIndex = Array.isArray(optionIndex) ? optionIndex[0] : optionIndex;
        const voteId = data.voteIds?.[0] || `vote-${Date.now()}`;

        await analytics.trackVote(
          primaryOptionIndex,
          voteId,
          !hasVoted // isFirstVoteInSession
        );

        // Track with existing analytics system
        trackVote(id)

        // Fetch updated results if not using real-time updates
        const resultsResponse = await fetch(`/api/polls/${id}/results`)
        if (resultsResponse.ok) {
          const updatedResults = await resultsResponse.json()
          setResults(updatedResults)
        }
      } else {
        throw new Error(data.error || 'Failed to record vote')
      }
    } catch (err) {
      console.error('Error submitting vote:', err)
      alert(err instanceof Error ? err.message : 'Failed to submit vote. Please try again.')
    } finally {
      setVoting(false)
    }
  }

  const handleShare = async (platform: string, method: 'button_click' | 'url_copy' | 'native_share') => {
    const url = `${window.location.origin}/poll/${id}`;

    // Track with advanced analytics
    await analytics.trackShare(platform, method, url);

    // Track with existing analytics system
    trackShare(platform, id);

    // Close modal
    setShowShareModal(false);
  }

  const handleOptionHover = (optionIndex: number, isHovering: boolean) => {
    analytics.trackOptionHover(optionIndex, isHovering);
  }

  const canShowResults = () => {
    if (forceResults) return true
    if (!poll) return false

    switch (poll.hide_results) {
      case 'entirely':
        return false
      case 'until_vote':
        return actuallyVoted
      case 'none':
      default:
        return true
    }
  }

  const shouldShowVotingInterface = () => {
    if (!poll) return false
    if (forceResults) return false
    return !hasVoted
  }

  const getPageTitle = () => {
    if (!poll) return 'Loading...'
    if (forceResults) return `Results: ${poll.question}`
    return poll.question
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Poll Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The poll you\'re looking for doesn\'t exist.'}</p>
          <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  📊 Analytics
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Share
                </button>
              </div>
            </div>

            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}

            {/* Poll Stats */}
            <PollStats
              poll={poll}
              totalVotes={results?.totalVotes || 0}
              showResults={canShowResults()}
              lastUpdate={lastResultsFetch}
            />
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <div className="mb-6">
              <PollAnalyticsDashboard pollId={id} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voting Interface */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {shouldShowVotingInterface() ? 'Cast Your Vote' : 'Your Selection'}
              </h2>

              {poll.poll_type === 'image' ? (
                <ImagePollVoting
                  pollId={id}
                  poll={poll}
                  selectedOption={selectedOption}
                  selectedOptions={selectedOptions}
                  setSelectedOption={setSelectedOption}
                  setSelectedOptions={setSelectedOptions}
                  onVote={handleVote}
                  voting={voting}
                  hasVoted={hasVoted}
                  disabled={!shouldShowVotingInterface()}
                  onOptionHover={handleOptionHover}
                />
              ) : (
                <div className="space-y-3">
                  {poll.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        poll.allow_multiple_selections
                          ? selectedOptions.includes(index)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                          : selectedOption === index
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      onMouseEnter={() => handleOptionHover(index, true)}
                      onMouseLeave={() => handleOptionHover(index, false)}
                    >
                      <input
                        type={poll.allow_multiple_selections ? 'checkbox' : 'radio'}
                        name="poll-option"
                        value={index}
                        checked={
                          poll.allow_multiple_selections
                            ? selectedOptions.includes(index)
                            : selectedOption === index
                        }
                        onChange={(e) => {
                          if (shouldShowVotingInterface()) {
                            if (poll.allow_multiple_selections) {
                              if (e.target.checked) {
                                if (selectedOptions.length < (poll.max_selections || 1)) {
                                  setSelectedOptions([...selectedOptions, index])
                                }
                              } else {
                                setSelectedOptions(selectedOptions.filter(i => i !== index))
                              }
                            } else {
                              setSelectedOption(index)
                            }
                          }
                        }}
                        disabled={!shouldShowVotingInterface()}
                        className="mr-3 text-purple-600"
                      />
                      <span className="flex-1 text-gray-700">{option}</span>
                    </label>
                  ))}

                  {poll.allow_multiple_selections && (
                    <p className="text-sm text-gray-500 mt-2">
                      Select up to {poll.max_selections} option{poll.max_selections !== 1 ? 's' : ''}
                      {selectedOptions.length > 0 && ` (${selectedOptions.length} selected)`}
                    </p>
                  )}

                  {shouldShowVotingInterface() && (
                    <button
                      onClick={handleVote}
                      disabled={
                        voting ||
                        (poll.allow_multiple_selections
                          ? selectedOptions.length === 0
                          : selectedOption === null)
                      }
                      className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-4"
                    >
                      {voting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Results</h2>
                {canShowResults() && results && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartType('doughnut')}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === 'doughnut'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Pie
                    </button>
                    <button
                      onClick={() => setChartType('bar')}
                      className={`px-3 py-1 rounded text-sm ${
                        chartType === 'bar'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Bar
                    </button>
                  </div>
                )}
              </div>

              {canShowResults() && results ? (
                <PollChart
                  data={results}
                  type={chartType}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="font-medium">Results Hidden</p>
                    <p className="text-sm">
                      {poll.hide_results === 'until_vote'
                        ? 'Vote to see results'
                        : 'Results are not visible for this poll'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {poll.comments_enabled && (
            <div className="mt-6">
              <Comments pollId={id} />
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          pollId={id}
          pollQuestion={poll.question}
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
        />
      )}
    </div>
  )
}