'use client'

import { useState } from 'react'
import QRCodeDisplay from './QRCodeDisplay'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  pollUrl: string
  pollTitle: string
}

export default function ShareModal({ isOpen, onClose, pollUrl, pollTitle }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState('share')
  const [copySuccess, setCopySuccess] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitedUsers] = useState([
    { name: 'Esther Howard', email: 'esther.howard@example.com', status: 'Invited' },
    { name: 'Kristin Watson', email: 'kristinwatson@gmail.com', status: 'Invited' },
    { name: 'Kathryn Murphy', email: 'murphy@gmail.com', status: 'Invited' }
  ])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSendInvite = () => {
    if (inviteEmail) {
      // Handle invite logic here
      setInviteEmail('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header with Tabs */}
        <div className="bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Share Poll</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-600">
            {['Share', 'Privacy', 'Publishing', 'Domain'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  activeTab === tab.toLowerCase()
                    ? 'text-white border-blue-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {activeTab === 'share' && (
            <div className="space-y-6">
              {/* QR Code and URL Section */}
              <div className="flex gap-4">
                {/* QR Code */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white rounded p-2 flex items-center justify-center">
                    <QRCodeDisplay url={pollUrl} size={64} showHeader={false} />
                  </div>
                </div>
                
                {/* URL Input */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="text"
                      value={pollUrl.replace('http://', '').replace('https://', '')}
                      readOnly
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {copySuccess ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors duration-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Domain */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-sm">Custom Domain</h3>
                    <p className="text-gray-400 text-xs mt-1">Available on paid team plans</p>
                  </div>
                  <button className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1.5 rounded transition-colors duration-200">
                    Configure
                  </button>
                </div>
              </div>

              {/* Invite Users */}
              <div>
                <h3 className="text-white font-medium text-sm mb-3">Invite users</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email"
                    className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <button
                    onClick={handleSendInvite}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition-colors duration-200"
                  >
                    Send invite
                  </button>
                </div>
                <p className="text-gray-400 text-xs mb-4">We'll email them instructions and a magic link to sign in.</p>
                
                {/* Invited Users List */}
                <div className="space-y-2">
                  {invitedUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{user.name}</div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </div>
                      <span className="text-gray-400 text-xs">{user.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Get Private Invite Link */}
              <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Get private invite link
              </button>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab === 'privacy' && (
            <div className="text-center py-8">
              <p className="text-gray-400">Privacy settings coming soon...</p>
            </div>
          )}
          
          {activeTab === 'publishing' && (
            <div className="text-center py-8">
              <p className="text-gray-400">Publishing options coming soon...</p>
            </div>
          )}
          
          {activeTab === 'domain' && (
            <div className="text-center py-8">
              <p className="text-gray-400">Domain settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}