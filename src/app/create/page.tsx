'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreatePollData, CreateImageOption } from '@/types/poll'
import { useAnalytics } from '@/hooks/useAnalytics'
import ImagePollCreator from '@/components/ImagePollCreator'

export default function CreatePoll() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [imageOptions, setImageOptions] = useState<CreateImageOption[]>([
    { imageUrl: '', caption: '' },
    { imageUrl: '', caption: '' }
  ])
  const [pollType, setPollType] = useState<'text' | 'image'>('text')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allowMultipleSelections, setAllowMultipleSelections] = useState(false)
  const [maxSelections, setMaxSelections] = useState(2)
  const [commentsEnabled, setCommentsEnabled] = useState(false)
  const router = useRouter()
  const { trackPollCreation } = useAnalytics()

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ''])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate inputs
    if (!question.trim()) {
      setError('Question is required')
      setLoading(false)
      return
    }

    // Validate based on poll type
    if (pollType === 'text') {
      const validOptions = options.filter(opt => opt.trim() !== '')
      if (validOptions.length < 2) {
        setError('At least 2 options are required')
        setLoading(false)
        return
      }
    } else {
      const validImageOptions = imageOptions.filter(opt => opt.imageUrl.trim() !== '')
      console.log('Image options:', imageOptions)
      console.log('Valid image options:', validImageOptions)
      if (validImageOptions.length < 2) {
        setError('At least 2 image options with URLs are required')
        setLoading(false)
        return
      }
    }

    try {
      const pollData: CreatePollData = {
        question: question.trim(),
        pollType,
        options: pollType === 'text' ? options : [], // Empty array for image polls
        allowMultipleSelections,
        maxSelections: allowMultipleSelections ? maxSelections : 1,
        commentsEnabled
      }

      if (pollType === 'text') {
        const validOptions = options.filter(opt => opt.trim() !== '')
        pollData.options = validOptions.map(opt => opt.trim())
      } else {
        const validImageOptions = imageOptions.filter(opt => opt.imageUrl.trim() !== '')
        pollData.imageOptions = validImageOptions
        pollData.options = validImageOptions.map((opt, index) => opt.caption || `Image ${index + 1}`)
        console.log('Sending image poll data:', pollData)
      }

      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pollData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create poll')
      }

      const { pollId } = await response.json()
      
      // Track poll creation for analytics
      const pollAnalyticsType = `${pollType}_${allowMultipleSelections ? 'multiple' : 'single'}`
      trackPollCreation(pollAnalyticsType)
      
      router.push(`/poll/${pollId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-1/4 w-40 h-40 bg-cotton-pink/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/3 left-1/6 w-32 h-32 bg-cotton-blue/5 rounded-full blur-2xl"></div>
        </div>

        <motion.div
          className="card relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
     
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
              >
                {error}
              </motion.div>
            )}

            {/* Poll Type Tabs */}
            <div className="flex bg-app-surface rounded-xl p-1 mb-8 border border-app">
              <motion.button
                type="button"
                onClick={() => setPollType('text')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  pollType === 'text'
                    ? 'bg-white text-cotton-purple shadow-sm border border-cotton-purple/20'
                    : 'text-app-secondary hover:text-app-primary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Text Poll
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setPollType('image')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  pollType === 'image'
                    ? 'bg-white text-cotton-purple shadow-sm border border-cotton-purple/20'
                    : 'text-app-secondary hover:text-app-primary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Poll
              </motion.button>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label htmlFor="question" className="block text-app-primary text-sm mb-3 font-semibold">
                Poll Question <span className="text-cotton-pink">*</span>
              </label>
              <div className="relative group">
                <input
                  id="question"
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to ask your audience?"
                  className="input-field w-full group-hover:shadow-lg group-hover:shadow-cotton-pink/10 transition-all duration-300"
                  maxLength={500}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink/5 via-cotton-purple/5 to-cotton-blue/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            
            {/* Poll Content - Conditional based on type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {pollType === 'text' ? (
                <>
                  <label className="block text-app-primary text-sm mb-3 font-semibold">
                    Answer Options <span className="text-cotton-pink">*</span>
                  </label>
                  <div className="space-y-4">
                    {options.map((option, index) => (
                      <motion.div 
                        key={index} 
                        className="flex items-center space-x-3 group"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cotton-purple/20 to-cotton-pink/20 rounded-lg flex items-center justify-center text-sm font-bold text-app-primary border border-cotton-purple/20">
                          {index + 1}
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Enter option ${index + 1}`}
                            className="input-field w-full group-hover:shadow-lg group-hover:shadow-cotton-purple/10 transition-all duration-300"
                            maxLength={100}
                          />
                        </div>
                        {options.length > 2 && (
                          <motion.button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="flex-shrink-0 w-8 h-8 text-app-secondary hover:text-cotton-pink bg-app-surface hover:bg-cotton-pink/10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Remove option"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {options.length < 10 && (
                      <motion.button
                        type="button"
                        onClick={addOption}
                        className="btn-gradient-border flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-cotton-purple leading-none"
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Option</span>
                      </motion.button>
                    )}
                  </div>
                </>
              ) : (
                <ImagePollCreator 
                  imageOptions={imageOptions}
                  onImageOptionsChange={setImageOptions}
                />
              )}

              {/* Multiple Selections Toggle - shown for both types */}
              <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-app">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="allowMultiple"
                    checked={allowMultipleSelections}
                    onChange={(e) => setAllowMultipleSelections(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                      allowMultipleSelections ? 'bg-cotton-purple' : 'bg-app-surface'
                    }`}
                    onClick={() => setAllowMultipleSelections(!allowMultipleSelections)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${
                      allowMultipleSelections ? 'translate-x-5' : 'translate-x-0.5'
                    } translate-y-0.5`}></div>
                  </div>
                  <label htmlFor="allowMultiple" className="text-sm text-app-muted font-medium cursor-pointer">
                    Allow Multiple Selections
                  </label>
                </div>

                {/* Max Selections Counter */}
                {allowMultipleSelections && (
                  <div className="flex items-center gap-2 bg-app-surface rounded-lg px-3 py-1">
                    <button
                      type="button"
                      onClick={() => setMaxSelections(Math.max(2, maxSelections - 1))}
                      className="w-6 h-6 bg-cotton-purple/20 hover:bg-cotton-purple/30 rounded-full flex items-center justify-center text-cotton-purple transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-sm font-medium text-app-primary min-w-[20px] text-center">
                      {maxSelections}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaxSelections(Math.min(
                        pollType === 'text' ? options.length : imageOptions.length,
                        maxSelections + 1
                      ))}
                      className="w-6 h-6 bg-cotton-purple/20 hover:bg-cotton-purple/30 rounded-full flex items-center justify-center text-cotton-purple transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Comments Toggle */}
              <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-app">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="commentsEnabled"
                    checked={commentsEnabled}
                    onChange={(e) => setCommentsEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                      commentsEnabled ? 'bg-cotton-blue' : 'bg-app-surface'
                    }`}
                    onClick={() => setCommentsEnabled(!commentsEnabled)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 transform ${
                      commentsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    } translate-y-0.5`}></div>
                  </div>
                  <label htmlFor="commentsEnabled" className="text-sm text-app-muted font-medium cursor-pointer">
                    Enable Comments & Discussion
                  </label>
                </div>
                <div className="flex items-center gap-1 text-xs text-app-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Logged in users only</span>
                </div>
              </div>
            </motion.div>

          

            {/* Submit Button */}
            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink/20 via-cotton-purple/20 to-cotton-blue/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                <div className="flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Poll...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Create Poll</span>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
