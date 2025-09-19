'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Comment, CreateCommentData } from '@/types/poll'
import { motion, AnimatePresence } from 'framer-motion'
import io from 'socket.io-client'

interface CommentsProps {
  pollId: string
  commentsEnabled: boolean
}

export default function Comments({ pollId, commentsEnabled }: CommentsProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when new comments arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [newComment])

  // Fetch initial comments
  useEffect(() => {
    if (!commentsEnabled) {
      setLoading(false)
      return
    }

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/polls/${pollId}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        } else if (response.status !== 403) {
          // Don't show error for disabled comments
          const errorData = await response.json()
          setError(errorData.error || 'Failed to load comments')
        }
      } catch (err) {
        console.error('Error fetching comments:', err)
        setError('Failed to load comments')
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [pollId, commentsEnabled])

  // Set up real-time Socket.IO connection for comments
  useEffect(() => {
    if (!commentsEnabled) return

    const socket = io({
      path: '/api/socket',
      timeout: 10000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      transports: ['polling', 'websocket']
    })

    socket.on('connect', () => {
      console.log('Connected to comments socket')
      socket.emit('join-comments', pollId)
    })

    socket.on('joined-comments', (data) => {
      console.log('Successfully joined comments room:', data)
    })

    socket.on('newComment', (comment: Comment) => {
      console.log('Received new comment:', comment)
      setComments(prev => [...prev, comment])
    })

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from comments socket:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('Comments socket connection error:', error)
    })

    return () => {
      socket.emit('leave-comments', pollId)
      socket.disconnect()
    }
  }, [pollId, commentsEnabled])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setError('Please sign in to comment')
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const commentData: CreateCommentData = {
        content: newComment.trim()
      }

      const response = await fetch(`/api/polls/${pollId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post comment')
      }

      // Comment will be added via Socket.IO
      setNewComment('')
      adjustTextareaHeight()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getAvatarFallback = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || '?'
  }

  if (!commentsEnabled) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 text-app-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-app-muted text-sm">Comments are disabled for this poll.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center space-x-2 text-app-secondary">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading comments...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-h-[500px] w-full overflow-hidden">
      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scroll-smooth overflow-x-hidden">
        <AnimatePresence>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <svg className="w-12 h-12 text-app-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-app-muted text-sm">No comments yet. Start the conversation!</p>
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex gap-3 group hover:bg-app-surface/30 -mx-2 px-2 py-2 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user_image ? (
                    <img
                      src={comment.user_image}
                      alt={comment.user_name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-app-surface"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cotton-purple to-cotton-pink flex items-center justify-center text-white text-sm font-bold border-2 border-app-surface">
                      {getAvatarFallback(comment.user_name)}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-app-primary text-sm">
                      {comment.user_name}
                    </span>
                    <span className="text-xs text-app-muted">
                      {formatTime(comment.created_at)}
                    </span>
                    {comment.is_edited && (
                      <span className="text-xs text-app-muted italic">
                        (edited)
                      </span>
                    )}
                  </div>
                  <p className="text-app-primary text-sm leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Comment Input */}
      <div className="border-t border-app pt-4 mt-4">
        {session ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'You'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-app-surface"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cotton-blue to-cotton-mint flex items-center justify-center text-white text-sm font-bold border-2 border-app-surface">
                    {getAvatarFallback(session.user?.name || 'You')}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-field w-full resize-none min-h-[40px] max-h-[120px] py-2 px-3 text-sm"
                  maxLength={1000}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (newComment.trim() && !submitting) {
                        handleSubmit(e)
                      }
                    }
                  }}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-app-muted">
                    {newComment.length}/1000 • Press Enter to send, Shift+Enter for new line
                  </span>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="btn-primary text-sm px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-app-muted text-sm mb-3"><a href="/auth/signin">s</a>Sign in to join the conversation</p>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="btn-secondary text-sm"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}