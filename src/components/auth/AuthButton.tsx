'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import LoginModal from './LoginModal'

interface AuthButtonProps {
  className?: string
}

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign-out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center space-x-2">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-app-primary">
            {session.user?.name || session.user?.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-app-primary bg-app-surface border border-app rounded-lg hover:bg-app-surface-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cotton-blue transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsLoginModalOpen(true)}
        className={`flex items-center px-4 py-2 text-sm font-medium text-app-primary bg-app-surface border border-app rounded-lg hover:bg-app-surface-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cotton-blue transition-all duration-200 ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign In
      </button>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}