'use client';

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink via-cotton-blue to-cotton-purple rounded-full blur-xl opacity-50 animate-pulse"></div>
              <Image 
                src="/logo.svg" 
                alt="Poll.it Logo" 
                width={200}
                height={60}
                className="h-16 w-auto relative z-10"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold text-app-primary mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Poll<span className="bg-gradient-to-r from-cotton-pink via-cotton-purple to-cotton-blue bg-clip-text text-transparent">.it</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-app-secondary mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Create instant polls with <span className="text-cotton-pink font-semibold">real-time results</span> and 
            <span className="text-cotton-blue font-semibold"> beautiful analytics</span>. 
            No sign-up required.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.a
              href="/create"
              className="btn-primary group relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink/20 via-cotton-purple/20 to-cotton-blue/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create a Poll</span>
            </motion.a>
            
            <motion.a
              href="#features"
              className="btn-secondary group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span>Learn More</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          id="features" 
          className="grid md:grid-cols-3 gap-8 mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div 
            className="card group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-cotton-pink mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-app-primary mb-4">Lightning Fast</h3>
            <p className="text-app-secondary leading-relaxed">
              Create and share polls in under 30 seconds. No registration or lengthy forms required.
            </p>
          </motion.div>

          <motion.div 
            className="card group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-cotton-blue mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-app-primary mb-4">Real-time Results</h3>
            <p className="text-app-secondary leading-relaxed">
              Watch votes come in live with beautiful charts and instant updates.
            </p>
          </motion.div>

          <motion.div 
            className="card group"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="text-cotton-purple mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-app-primary mb-4">Easy Sharing</h3>
            <p className="text-app-secondary leading-relaxed">
              Share via unique URLs, QR codes, or social media. Works on any device.
            </p>
          </motion.div>
        </motion.div>

        {/* How It Works */}
        <motion.div 
          className="card mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-4xl font-bold text-app-primary text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="gradient-circle w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-2xl font-bold text-app-primary mb-4">Create</h3>
              <p className="text-app-secondary leading-relaxed">Write your question and add multiple choice options</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="gradient-circle w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-2xl font-bold text-app-primary mb-4">Share</h3>
              <p className="text-app-secondary leading-relaxed">Get a unique URL and share it with your audience</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="gradient-circle w-20 h-20 flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-2xl font-bold text-app-primary mb-4">Results</h3>
              <p className="text-app-secondary leading-relaxed">Watch live results and analytics as votes pour in</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <h2 className="text-4xl font-bold text-app-primary mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-app-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who trust <span className="text-cotton-pink font-semibold">Poll.it</span> for their polling needs.
          </p>
          <motion.a
            href="/create"
            className="btn-primary group relative overflow-hidden inline-flex"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink/20 via-cotton-purple/20 to-cotton-blue/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Your First Poll</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
}
