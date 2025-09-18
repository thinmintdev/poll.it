'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null)

  const handleSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setLoadingProvider(provider)
    try {
      await signIn(provider, { callbackUrl: '/' })
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="card max-w-md w-full relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Gradient Border Accent */}
        <div className="absolute -inset-0.5 bg-gradient-primary rounded-2xl opacity-20 blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gradient-primary">Sign In</h2>
              <p className="text-app-muted text-sm mt-1">Connect your account to track polls and voting</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-app-muted hover:text-app-primary hover:bg-app-surface transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Benefits Section */}
          <div className="mb-6 p-4 bg-app-surface rounded-lg border border-app-surface-light">
            <h3 className="text-app-primary font-semibold text-sm mb-3">Why sign in?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-app-secondary">
                <div className="w-1.5 h-1.5 bg-cotton-mint rounded-full flex-shrink-0"></div>
                <span>Track your created polls</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-app-secondary">
                <div className="w-1.5 h-1.5 bg-cotton-blue rounded-full flex-shrink-0"></div>
                <span>View poll analytics and stats</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-app-secondary">
                <div className="w-1.5 h-1.5 bg-cotton-purple rounded-full flex-shrink-0"></div>
                <span>Access your personal dashboard</span>
              </div>
            </div>
          </div>

          {/* Login Options */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-cotton-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-app-primary font-semibold">Choose your sign-in method</h3>
            </div>

            {/* Google Sign In */}
            <motion.button
              onClick={() => handleSignIn('google')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-4 bg-app-surface hover:bg-app-surface-light rounded-lg border border-app transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {loadingProvider === 'google' ? (
                <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="font-medium text-app-primary">
                {loadingProvider === 'google' ? 'Signing in...' : 'Continue with Google'}
              </span>
            </motion.button>

            {/* GitHub Sign In */}
            <motion.button
              onClick={() => handleSignIn('github')}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-4 bg-app-surface hover:bg-app-surface-light rounded-lg border border-app transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {loadingProvider === 'github' ? (
                <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path className="text-gray-800" fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              <span className="font-medium text-app-primary">
                {loadingProvider === 'github' ? 'Signing in...' : 'Continue with GitHub'}
              </span>
            </motion.button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 pt-4 border-t border-app-surface">
            <p className="text-xs text-app-muted text-center">
              By signing in, you agree to our terms of service and privacy policy.
              We&apos;ll only access basic profile information.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}