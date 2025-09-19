'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import LoginModal from './LoginModal'

interface AuthButtonProps {
  className?: string
}

interface DropdownMenuItemProps {
  href: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ href, icon, label, onClick }) => (
  <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-2 text-sm text-app-secondary hover:bg-white/5 hover:text-cotton-purple transition-all duration-200 rounded-lg mx-2"
    >
      <span className="mr-3 text-app-muted">{icon}</span>
      {label}
    </Link>
  </motion.div>
)

export default function AuthButton({ className = '' }: AuthButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSignOut = async () => {
    setIsLoading(true)
    setIsDropdownOpen(false)
    try {
      await signOut({ callbackUrl: '/' })
    } catch (error) {
      console.error('Sign-out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 w-24 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (session) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/5 focus:outline-none focus:ring-cotton-purple focus:ring-opacity-50 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full border-white/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center border-2 border-app-light/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          <motion.svg
            className="w-4 h-4 text-app-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="absolute right-0 mt-4 w-56 glass-card backdrop-blur-xl rounded-b-xl z-50"
            >
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-primary truncate">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-app-secondary truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <DropdownMenuItem
                  href="/create"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                  label="Create New"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <DropdownMenuItem
                  href="/dashboard"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  label="Dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <DropdownMenuItem
                  href="/settings"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Settings"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="my-1 border-t border-white/20"></div>

                <motion.button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full flex items-center px-4 py-2 text-sm text-app-secondary hover:bg-white/5 hover:text-cotton-purple transition-all duration-200 rounded-lg mx-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isLoading ? { x: 2 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  <span className="mr-3 text-app-muted">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  {isLoading ? 'Signing out...' : 'Log Out'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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