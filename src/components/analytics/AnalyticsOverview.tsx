'use client'

import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { TrendingUp, TrendingDown, Activity, Users, Timer, Globe } from 'lucide-react'
import { AnalyticsData } from '@/types/poll'

interface AnalyticsOverviewProps {
  analytics: AnalyticsData
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ analytics }) => {
  // Prepare time series data for engagement chart
  const timeSeriesData = {
    labels: analytics.daily_analytics?.map(day =>
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Views',
        data: analytics.daily_analytics?.map(day => day.views) || [],
        borderColor: 'var(--cotton-candy-blue)',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Votes',
        data: analytics.daily_analytics?.map(day => day.votes) || [],
        borderColor: 'var(--cotton-candy-pink)',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Calculate trends
  const recentDays = analytics.daily_analytics?.slice(-7) || []
  const previousDays = analytics.daily_analytics?.slice(-14, -7) || []

  const recentViews = recentDays.reduce((sum, day) => sum + day.views, 0)
  const previousViews = previousDays.reduce((sum, day) => sum + day.views, 0)
  const viewsTrend = previousViews > 0 ? ((recentViews - previousViews) / previousViews) * 100 : 0

  const recentVotes = recentDays.reduce((sum, day) => sum + day.votes, 0)
  const previousVotes = previousDays.reduce((sum, day) => sum + day.votes, 0)
  const votesTrend = previousVotes > 0 ? ((recentVotes - previousVotes) / previousVotes) * 100 : 0

  // Performance metrics
  const performanceMetrics = [
    {
      label: 'Bounce Rate',
      value: `${(analytics.bounce_rate * 100).toFixed(1)}%`,
      icon: Activity,
      trend: -analytics.bounce_rate * 20, // Lower is better
      color: 'cotton-purple'
    },
    {
      label: 'Return Visitors',
      value: `${(analytics.return_visitor_rate * 100).toFixed(1)}%`,
      icon: Users,
      trend: analytics.return_visitor_rate * 100,
      color: 'cotton-mint'
    },
    {
      label: 'Avg. Time on Page',
      value: formatDuration(analytics.avg_time_on_page),
      icon: Timer,
      trend: analytics.avg_time_on_page > 60 ? 15 : -10,
      color: 'cotton-peach'
    },
    {
      label: 'Viral Coefficient',
      value: analytics.viral_coefficient.toFixed(2),
      icon: Globe,
      trend: (analytics.viral_coefficient - 1) * 100,
      color: 'cotton-lavender'
    }
  ]

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <div key={index} className="glass-card rounded-xl p-6 hover-glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                  <span className="text-sm font-medium text-app-muted">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-app-primary mb-2">
                  {metric.value}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend > 0 ? 'text-cotton-mint' : 'text-cotton-pink'
                }`}>
                  {metric.trend > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                  <span className="text-app-muted ml-1">vs last week</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Timeline */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-primary">Engagement Timeline</h3>
          <div className="flex items-center gap-4 text-sm text-app-muted">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cotton-blue"></div>
              <span>Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cotton-pink"></div>
              <span>Votes</span>
            </div>
          </div>
        </div>

        {analytics.daily_analytics && analytics.daily_analytics.length > 0 ? (
          <div className="h-80">
            <Line
              data={timeSeriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    backgroundColor: 'var(--bg-card)',
                    titleColor: 'var(--text-primary)',
                    bodyColor: 'var(--text-secondary)',
                    borderColor: 'var(--border-light)',
                    borderWidth: 1,
                    cornerRadius: 8
                  }
                },
                scales: {
                  x: {
                    grid: {
                      color: 'var(--border)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'var(--text-muted)'
                    }
                  },
                  y: {
                    grid: {
                      color: 'var(--border)',
                      drawBorder: false
                    },
                    ticks: {
                      color: 'var(--text-muted)'
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                }
              }}
            />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-app-muted">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-cotton-purple" />
              <p>No timeline data available</p>
              <p className="text-sm">Data will appear as engagement grows</p>
            </div>
          </div>
        )}
      </div>

      {/* Engagement Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold text-app-primary mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {[
              { label: 'Page Views', value: analytics.total_views, percentage: 100, color: 'cotton-blue' },
              { label: 'Engaged Users', value: Math.round(analytics.total_views * (1 - analytics.bounce_rate)), percentage: (1 - analytics.bounce_rate) * 100, color: 'cotton-purple' },
              { label: 'Voted', value: analytics.total_votes, percentage: analytics.completion_rate * 100, color: 'cotton-pink' },
              { label: 'Shared', value: analytics.total_shares, percentage: (analytics.total_shares / analytics.total_views) * 100, color: 'cotton-mint' }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-app-primary">{step.label}</span>
                  <div className="text-right">
                    <div className="font-bold text-app-primary">{step.value.toLocaleString()}</div>
                    <div className={`text-sm text-${step.color}`}>{step.percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="w-full bg-app-surface rounded-full h-3">
                  <div
                    className={`h-full bg-${step.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${step.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-xl font-semibold text-app-primary mb-6">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: 'Peak Activity Hour', value: `${analytics.peak_hour}:00`, description: 'Most active time of day' },
              { label: 'Views Trend', value: `${viewsTrend > 0 ? '+' : ''}${viewsTrend.toFixed(1)}%`, description: 'Change from last week' },
              { label: 'Votes Trend', value: `${votesTrend > 0 ? '+' : ''}${votesTrend.toFixed(1)}%`, description: 'Change from last week' },
              { label: 'Engagement Rate', value: `${((analytics.total_votes + analytics.total_shares) / analytics.total_views * 100).toFixed(1)}%`, description: 'Votes + shares vs views' }
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                <div>
                  <div className="font-medium text-app-primary">{stat.label}</div>
                  <div className="text-sm text-app-muted">{stat.description}</div>
                </div>
                <div className="text-lg font-bold text-cotton-purple">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsOverview