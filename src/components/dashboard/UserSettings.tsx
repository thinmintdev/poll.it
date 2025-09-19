'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'

interface UserSettingsProps {
  user: User
}

export default function UserSettings({ user }: UserSettingsProps) {
  const { update } = useSession()
  const [displayName, setDisplayName] = useState(user.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user.image || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName,
          image: avatarUrl,
        }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' })
        // Update the session with new data
        await update()

        // Clear the success message after a delay
        setTimeout(() => {
          setMessage(null)
        }, 3000)
      } else {
        throw new Error('Failed to update settings')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const isValidImageUrl = (url: string) => {
    if (!url) return true // Empty URL is valid
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg)(\\?.*)?$/i.test(url)
    } catch {
      return false
    }
  }

  const hasChanges = displayName !== (user.name || '') || avatarUrl !== (user.image || '')

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-app-primary">Profile Settings</h2>
            <p className="text-app-secondary">Manage your account information and preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Avatar Preview */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-app-light/20">
                {avatarUrl && isValidImageUrl(avatarUrl) ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-app-primary text-sm font-medium mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="input-field w-full"
              />
              <p className="text-xs text-app-muted mt-1">
                Provide a direct link to your profile image
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-app-primary text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="input-field w-full"
              maxLength={50}
            />
            <p className="text-xs text-app-muted mt-1">
              This name will be displayed across the platform
            </p>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-app-primary text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="input-field w-full opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-app-muted mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-app-primary text-sm font-medium mb-2">
                User ID
              </label>
              <input
                type="text"
                value={user.id || ''}
                disabled
                className="input-field w-full opacity-50 cursor-not-allowed font-mono text-xs"
              />
              <p className="text-xs text-app-muted mt-1">
                Unique identifier
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t border-app-light/20">
            <div className="flex-1">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm ${
                    message.type === 'success' ? 'text-cotton-mint' : 'text-cotton-pink'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={handleSaveSettings}
              disabled={!hasChanges || isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                hasChanges && !isLoading
                  ? 'bg-gradient-primary text-white hover:shadow-lg'
                  : 'bg-app-surface text-app-muted cursor-not-allowed'
              }`}
              whileHover={hasChanges && !isLoading ? { y: -1 } : {}}
              whileTap={hasChanges && !isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-app-primary">Preferences</h2>
            <p className="text-app-secondary">Customize your experience</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-app-surface rounded-lg border border-app">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-app-primary">Email Notifications</h3>
                <p className="text-sm text-app-secondary">Receive updates about your polls</p>
              </div>
              <div className="text-sm text-app-muted">Coming soon</div>
            </div>
          </div>

          <div className="p-4 bg-app-surface rounded-lg border border-app">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-app-primary">Privacy Settings</h3>
                <p className="text-sm text-app-secondary">Control poll visibility and data</p>
              </div>
              <div className="text-sm text-app-muted">Coming soon</div>
            </div>
          </div>

          <div className="p-4 bg-app-surface rounded-lg border border-app">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-app-primary">Theme Preferences</h3>
                <p className="text-sm text-app-secondary">Customize the appearance</p>
              </div>
              <div className="text-sm text-app-muted">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}