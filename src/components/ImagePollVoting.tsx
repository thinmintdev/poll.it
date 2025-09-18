'use client'
import { Poll } from '@/types/poll'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface Result {
  votes: number
  percentage: number
}

interface Results {
  totalVotes: number
  results: Result[]
}

interface ImagePollVotingProps {
  poll: Poll
  results: Results | null
  hasVoted: boolean
  voting: boolean
  selectedOptions: number[]
  onOptionSelect: (index: number) => void
  onVote: () => void
  onBackToPoll: () => void
  onViewResults: () => void
  error: string | null
  actuallyVoted?: boolean
}

export default function ImagePollVoting({
  poll,
  results,
  hasVoted,
  voting,
  selectedOptions,
  onOptionSelect,
  onVote,
  onBackToPoll,
  onViewResults,
  error,
  actuallyVoted
}: ImagePollVotingProps) {
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set())
  const [imageLoading, setImageLoading] = useState<Set<number>>(new Set())

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

  const handleImageLoad = (index: number) => {
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index))
    setImageLoading(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const handleImageLoadStart = (index: number) => {
    setImageLoading(prev => new Set(prev).add(index))
  }

  if (!hasVoted) {
    // Voting Interface
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {poll.image_options?.map((imageOption, index) => {
            const isSelected = poll.allow_multiple_selections 
              ? selectedOptions.includes(index)
              : selectedOptions.includes(index)
            const colorTheme = getCottonColor(index)
            const isLoading = imageLoading.has(index)
            const hasError = imageLoadErrors.has(index)
            
            return (
              <motion.div
                key={index}
                className={`relative cursor-pointer group transition-all duration-300 ${
                  isSelected ? 'transform scale-105' : 'hover:scale-102'
                }`}
                onClick={() => onOptionSelect(index)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection Border */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'ring-4 ring-cotton-purple shadow-2xl' 
                      : 'ring-0 group-hover:ring-2 group-hover:ring-app-muted/30'
                  }`}
                  style={{
                    background: isSelected 
                      ? `linear-gradient(135deg, ${colorTheme.accent}20, ${colorTheme.accent}10)` 
                      : 'transparent'
                  }}
                />
                
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-xl bg-app-surface aspect-video">
                  {/* Loading State */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-app-surface">
                      <div className="flex items-center space-x-2 text-app-secondary">
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm">Loading...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {hasError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-app-surface border-2 border-red-500/20">
                      <div className="text-center text-red-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm">Failed to load image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image */}
                  {!hasError && (
                    <img
                      src={imageOption.image_url}
                      alt={imageOption.caption || `Option ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onLoadStart={() => handleImageLoadStart(index)}
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                  )}
                  
                  {/* Selection Indicator */}
                  {poll.allow_multiple_selections && (
                    <div className="absolute top-3 right-3">
                      <div className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                        isSelected 
                          ? 'bg-cotton-purple border-cotton-purple shadow-lg' 
                          : 'bg-white/90 border-white/90 backdrop-blur-sm'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Single Selection Ring */}
                  {!poll.allow_multiple_selections && isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-6 h-6 rounded-full bg-cotton-purple border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Caption */}
                {imageOption.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-medium text-sm bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 transition-all duration-300">
                      {imageOption.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
        
        {poll.allow_multiple_selections && (
          <div className="mb-4 text-sm text-app-muted text-center">
            {selectedOptions.length === 0 
              ? `Select up to ${poll.max_selections || 1} image${(poll.max_selections || 1) > 1 ? 's' : ''}`
              : `${selectedOptions.length} of ${poll.max_selections || 1} selected`
            }
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <button
            onClick={onVote}
            disabled={selectedOptions.length === 0 || voting}
            className="btn-primary w-full"
          >
            {voting ? 'Voting...' : 'Vote'}
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={onViewResults}
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
    )
  }

  // Results Interface
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {poll.image_options?.map((imageOption, index) => {
          const result = results?.results[index]
          const percent = result?.percentage || 0
          const voteCount = result?.votes || 0
          const isSelected = selectedOptions.includes(index)
          const colorTheme = getCottonColor(index)
          const hasError = imageLoadErrors.has(index)
          
          return (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Results Border */}
              <div
                className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                  isSelected ? 'ring-4 ring-cotton-purple' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${colorTheme.accent}15, ${colorTheme.accent}05)`
                }}
              />
              
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-xl bg-app-surface aspect-video">
                {/* Error State */}
                {hasError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-app-surface border-2 border-red-500/20">
                    <div className="text-center text-red-400">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={imageOption.image_url}
                    alt={imageOption.caption || `Option ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )}
                
                {/* Results Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Vote Count Badge */}
                <div className="absolute top-3 right-3">
                  <div 
                    className="px-3 py-1 rounded-full text-white font-bold text-sm backdrop-blur-sm"
                    style={{ backgroundColor: `${colorTheme.accent}90` }}
                  >
                    {voteCount} vote{voteCount !== 1 ? 's' : ''}
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 left-3">
                    <div className="w-6 h-6 bg-cotton-purple border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Caption and Percentage */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      {imageOption.caption && (
                        <p className="text-white font-medium text-sm mb-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
                          {imageOption.caption}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div 
                        className="text-2xl font-bold text-white drop-shadow-lg"
                        style={{ color: colorTheme.accent }}
                      >
                        {percent.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-app-surface rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{ background: colorTheme.gradient }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 }}
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
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <p className="text-app-muted text-sm mb-6 text-center">
        Total votes: {results?.totalVotes || 0}
      </p>
      
      {!actuallyVoted && (
        <div className="flex items-center gap-4">
          <button
            className="btn-secondary w-full"
            onClick={onBackToPoll}
          >
            Back to Poll
          </button>
        </div>
      )}
      
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