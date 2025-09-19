'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AuthButton from '@/components/auth/AuthButton'

const Header: React.FC = () => {

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-card backdrop-blur-xl border-b border-app-light/30 transition-all duration-300"
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

          {/* Auth Button - Visible on all screen sizes */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
