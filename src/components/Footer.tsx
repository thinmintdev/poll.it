'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-app-bg mt-auto">
      <div className="container mx-auto px-6">
        {/* Cotton candy gradient HR */}
        <div className="h-px bg-gradient-to-r from-cotton-candy-pink via-cotton-candy-purple to-cotton-candy-blue mb-8"></div>

        <div className="py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo and Copyright */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image 
                  src="/poll_logo.svg" 
                  alt="Poll.it Logo" 
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-app-primary font-semibold"></span>
              </Link>
              <span className="text-app-muted text-sm">
                © {currentYear} All rights reserved.
              </span>
            </div>

        
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
