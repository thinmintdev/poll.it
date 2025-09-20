'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Calendar, Download, Eye, Users, Vote, Share2, Clock, TrendingUp, MapPin, Smartphone, Globe, BarChart3 } from 'lucide-react'
import { AnalyticsData, ExportData } from '@/types/poll'
import { AnalyticsOverview } from './AnalyticsOverview'
import { EngagementChart } from './EngagementChart'
import { GeographicMap } from './GeographicMap'
import { DeviceBreakdown } from './DeviceBreakdown'
import { ShareAnalytics } from './ShareAnalytics'
import { ExportModal } from './ExportModal'
import { DateRangeSelector } from './DateRangeSelector'
import { LoadingSkeleton } from './LoadingSkeleton'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
)

interface AnalyticsDashboardProps {
  pollId: string
  className?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  pollId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  })
  const [showExportModal, setShowExportModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'geographic' | 'devices' | 'sharing'>('overview')

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        daily: 'true',
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      })

      const response = await fetch(`/api/analytics/${pollId}?${params}`)
      const result = await response.json()

      if (result.success) {
        setAnalytics(result.data)
      } else {
        setError(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      setError('Network error while fetching analytics')
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [pollId, dateRange])

  useEffect(() => {
    if (pollId) {
      fetchAnalytics()
    }
  }, [fetchAnalytics])

  // Handle data export
  const handleExport = async (exportData: ExportData) => {
    try {
      const params = new URLSearchParams({
        format: exportData.format,
        start: exportData.dateRange.start,
        end: exportData.dateRange.end,
        includeDetails: exportData.includeDetails.toString()
      })

      const response = await fetch(`/api/analytics/${pollId}/export?${params}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `poll-analytics-${pollId}-${exportData.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setShowExportModal(false)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Format utility functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(1)}%`

  if (loading) {
    return (
      <div className={`glass-card rounded-2xl ${className}`}>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className={`glass-card rounded-2xl p-8 text-center ${className}`}>
        <div className="text-app-muted">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-cotton-pink" />
          <h3 className="text-xl font-semibold text-app-primary mb-2">Analytics Unavailable</h3>
          <p className="text-app-secondary">{error || 'No analytics data found for this poll'}</p>
          <button
            onClick={fetchAnalytics}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'geographic', label: 'Geographic', icon: MapPin },
    { id: 'devices', label: 'Devices', icon: Smartphone },
    { id: 'sharing', label: 'Sharing', icon: Share2 }
  ] as const

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gradient-primary mb-2">
              Poll Analytics Dashboard
            </h1>
            <p className="text-app-secondary line-clamp-2 max-w-2xl">
              {analytics.question}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-app-muted">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created {new Date(analytics.poll_created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Updated {new Date(analytics.analytics_updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <button
              onClick={() => setShowExportModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Views', value: formatNumber(analytics.total_views), icon: Eye, color: 'cotton-blue' },
            { label: 'Unique Viewers', value: formatNumber(analytics.unique_viewers), icon: Users, color: 'cotton-mint' },
            { label: 'Total Votes', value: formatNumber(analytics.total_votes), icon: Vote, color: 'cotton-purple' },
            { label: 'Completion Rate', value: formatPercentage(analytics.completion_rate), icon: TrendingUp, color: 'cotton-pink' }
          ].map((metric, index) => (
            <div key={index} className="bg-app-tertiary rounded-xl p-4 border border-app-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-app-muted font-medium">{metric.label}</p>
                  <p className={`text-2xl font-bold text-${metric.color}`}>{metric.value}</p>
                </div>
                <metric.icon className={`w-8 h-8 text-${metric.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card rounded-2xl p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'text-app-secondary hover:text-app-primary hover:bg-app-surface'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && (
          <AnalyticsOverview analytics={analytics} />
        )}
        {activeTab === 'engagement' && (
          <EngagementChart analytics={analytics} />
        )}
        {activeTab === 'geographic' && (
          <GeographicMap analytics={analytics} />
        )}
        {activeTab === 'devices' && (
          <DeviceBreakdown analytics={analytics} />
        )}
        {activeTab === 'sharing' && (
          <ShareAnalytics analytics={analytics} />
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
          dateRange={dateRange}
        />
      )}
    </div>
  )
}

export default AnalyticsDashboard