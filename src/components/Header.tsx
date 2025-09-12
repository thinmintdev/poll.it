'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-card backdrop-blur-xl border-b border-app-light' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center">
              <div className="relative">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-40 h-10"
                >
                  <Image 
                    src="/poll_logo.svg" 
                    alt="Poll.it Logo" 
                    width={150}
                    height={88}
                    className="w-full h-full"
                  />
                </motion.div>
                <div className="absolute pt-4 -top-0 -right-1 text-gradient-primary uppercase text-xs animate-pulse">beta</div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            
            
            
            
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 text-app-secondary hover:text-app-primary transition-colors"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 107, 157, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-primary text-white rounded-xl font-medium hover-glow transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-app-primary hover:text-cotton-pink transition-colors"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 py-4 border-t border-app-light"
            >
              <div className="flex flex-col space-y-4">
                <MobileNavLink href="/" label="Home" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink href="/create" label="Create Poll" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink href="/#feed" label="Live Feed" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink href="/about" label="About" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="pt-4 border-t border-app-light">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-primary text-white rounded-xl font-medium"
                  >
                    Get Started
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

const NavLink: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
    <Link
      href={href}
      className="text-app-secondary hover:text-cotton-pink transition-colors font-medium relative group"
    >
      {label}
      <motion.div
        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300"
        whileHover={{ width: "100%" }}
      />
    </Link>
  </motion.div>
)

const MobileNavLink: React.FC<{ href: string; label: string; onClick: () => void }> = ({ href, label, onClick }) => (
  <motion.div whileTap={{ scale: 0.95 }}>
    <Link
      href={href}
      onClick={onClick}
      className="block py-2 text-app-secondary hover:text-cotton-pink transition-colors font-medium"
    >
      {label}
    </Link>
  </motion.div>
)

export default Header
