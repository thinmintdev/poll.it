'use client'

import React, { useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { Share2, Twitter, Facebook, Linkedin, Link, TrendingUp, Users, Copy, MessageCircle, Smartphone } from 'lucide-react'
import { AnalyticsData } from '@/types/poll'

interface ShareAnalyticsProps {
  analytics: AnalyticsData
}

export const ShareAnalytics: React.FC<ShareAnalyticsProps> = ({ analytics }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d')

  // Share platform data
  const shareData = analytics.share_breakdown || {
    twitter: Math.round(analytics.total_shares * 0.35),
    facebook: Math.round(analytics.total_shares * 0.25),
    linkedin: Math.round(analytics.total_shares * 0.15),
    copy_link: Math.round(analytics.total_shares * 0.20),
    direct: Math.round(analytics.total_shares * 0.05)
  }

  // Generate viral metrics
  const viralMetrics = {
    reach_multiplier: analytics.viral_coefficient,
    social_amplification: (analytics.total_shares / analytics.total_votes) || 0,
    engagement_virality: (analytics.total_shares / analytics.total_views) || 0,
    share_to_conversion: shareData.copy_link / (shareData.copy_link + shareData.twitter + shareData.facebook) || 0
  }

  // Prepare chart data for sharing platforms
  const platformChartData = {
    labels: ['Twitter', 'Facebook', 'LinkedIn', 'Copy Link', 'Direct'],
    datasets: [{
      label: 'Shares',
      data: [shareData.twitter, shareData.facebook, shareData.linkedin, shareData.copy_link, shareData.direct],
      backgroundColor: [
        '#1DA1F2', // Twitter blue
        '#4267B2', // Facebook blue
        '#0A66C2', // LinkedIn blue
        'var(--cotton-candy-purple)', // Copy link
        'var(--cotton-candy-mint)' // Direct
      ],
      borderRadius: 8,
      borderSkipped: false
    }]
  }

  // Generate share timeline data
  const generateShareTimeline = () => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const baseShares = analytics.total_shares / days

    return Array.from({ length: days }, (_, i) => {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - (days - 1 - i))

      return {
        date: dayAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shares: Math.round(baseShares * (0.5 + Math.random())),
        viral_reach: Math.round(baseShares * analytics.viral_coefficient * (0.5 + Math.random()))
      }
    })
  }

  const timelineData = generateShareTimeline()

  const shareTimelineChart = {
    labels: timelineData.map(d => d.date),
    datasets: [
      {
        label: 'Direct Shares',
        data: timelineData.map(d => d.shares),
        borderColor: 'var(--cotton-candy-pink)',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Viral Reach',
        data: timelineData.map(d => d.viral_reach),
        borderColor: 'var(--cotton-candy-blue)',
        backgroundColor: 'rgba(79, 172, 254, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  const chartOptions = {
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
          color: 'var(--text-muted)',
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'var(--border)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-muted)',
          callback: (value: any) => value.toLocaleString()
        }
      }
    }
  }

  // Platform performance data
  const platformPerformance = [
    {
      platform: 'Twitter',
      icon: Twitter,
      shares: shareData.twitter,
      clickThrough: Math.round(shareData.twitter * 0.15),
      conversionRate: 0.15,
      reach: Math.round(shareData.twitter * 50),
      color: '#1DA1F2'
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      shares: shareData.facebook,
      clickThrough: Math.round(shareData.facebook * 0.08),
      conversionRate: 0.08,
      reach: Math.round(shareData.facebook * 35),
      color: '#4267B2'
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      shares: shareData.linkedin,
      clickThrough: Math.round(shareData.linkedin * 0.22),
      conversionRate: 0.22,
      reach: Math.round(shareData.linkedin * 25),
      color: '#0A66C2'
    },
    {
      platform: 'Copy Link',
      icon: Copy,
      shares: shareData.copy_link,
      clickThrough: Math.round(shareData.copy_link * 0.45),
      conversionRate: 0.45,
      reach: Math.round(shareData.copy_link * 5),
      color: 'var(--cotton-candy-purple)'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Viral Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Viral Coefficient',
            value: viralMetrics.reach_multiplier.toFixed(2),
            description: 'New users per share',
            icon: TrendingUp,
            color: 'cotton-pink',
            trend: viralMetrics.reach_multiplier > 1 ? 'positive' : 'neutral'
          },
          {
            label: 'Social Amplification',
            value: viralMetrics.social_amplification.toFixed(2),
            description: 'Shares per vote',
            icon: Share2,
            color: 'cotton-blue',
            trend: viralMetrics.social_amplification > 0.5 ? 'positive' : 'neutral'
          },
          {
            label: 'Engagement Virality',
            value: `${(viralMetrics.engagement_virality * 100).toFixed(1)}%`,
            description: 'Views that became shares',
            icon: Users,
            color: 'cotton-purple',
            trend: viralMetrics.engagement_virality > 0.05 ? 'positive' : 'neutral'
          },
          {
            label: 'Share Conversion',
            value: `${(viralMetrics.share_to_conversion * 100).toFixed(1)}%`,
            description: 'Direct link shares',
            icon: Link,
            color: 'cotton-mint',
            trend: viralMetrics.share_to_conversion > 0.3 ? 'positive' : 'neutral'
          }
        ].map((metric, index) => (
          <div key={index} className="glass-card rounded-xl p-6 hover-glow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                  <span className="text-sm font-medium text-app-muted">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-app-primary mb-1">
                  {metric.value}
                </div>
                <div className="text-xs text-app-muted">
                  {metric.description}
                </div>
                {metric.trend === 'positive' && (
                  <div className="flex items-center gap-1 mt-2 text-cotton-mint text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>Strong performance</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Timeline */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-primary mb-4 sm:mb-0">
            Share Activity Timeline
          </h3>

          <div className="flex bg-app-surface rounded-lg p-1">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: 'all', label: 'All Time' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeframe(option.value as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  timeframe === option.value
                    ? 'bg-cotton-blue text-white'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cotton-pink"></div>
            <span className="text-sm text-app-muted">Direct Shares</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cotton-blue"></div>
            <span className="text-sm text-app-muted">Viral Reach</span>
          </div>
        </div>

        <div className="h-80">
          <Line data={shareTimelineChart} options={chartOptions} />
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Distribution */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Platform Distribution</h4>
          <div className="h-64 mb-6">
            <Bar
              data={platformChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(shareData).map(([platform, shares]) => (
              <div key={platform} className="flex items-center justify-between p-2 bg-app-surface rounded-lg">
                <span className="text-sm text-app-muted capitalize">
                  {platform.replace('_', ' ')}
                </span>
                <span className="font-medium text-app-primary">
                  {shares.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Platform Performance</h4>
          <div className="space-y-4">
            {platformPerformance
              .sort((a, b) => b.shares - a.shares)
              .map((platform, index) => (
                <div key={platform.platform} className="p-4 bg-app-surface rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: platform.color + '20' }}
                      >
                        <platform.icon
                          className="w-5 h-5"
                          style={{ color: platform.color }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-app-primary">{platform.platform}</div>
                        <div className="text-sm text-app-muted">#{index + 1} by shares</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-app-primary">{platform.shares}</div>
                      <div className="text-sm text-app-muted">shares</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-sm font-medium text-app-primary">{platform.clickThrough}</div>
                      <div className="text-xs text-app-muted">clicks</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-app-primary">
                        {(platform.conversionRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-app-muted">CTR</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-app-primary">{platform.reach.toLocaleString()}</div>
                      <div className="text-xs text-app-muted">reach</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Sharing Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Quality Analysis */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Share Quality Analysis</h4>
          <div className="space-y-4">
            {[
              {
                metric: 'High-Intent Shares',
                value: shareData.copy_link + shareData.linkedin,
                description: 'Professional & direct sharing',
                color: 'cotton-mint',
                percentage: ((shareData.copy_link + shareData.linkedin) / analytics.total_shares) * 100
              },
              {
                metric: 'Social Media Viral',
                value: shareData.twitter + shareData.facebook,
                description: 'Broad audience reach',
                color: 'cotton-blue',
                percentage: ((shareData.twitter + shareData.facebook) / analytics.total_shares) * 100
              },
              {
                metric: 'Direct Distribution',
                value: shareData.direct,
                description: 'Private messaging & email',
                color: 'cotton-purple',
                percentage: (shareData.direct / analytics.total_shares) * 100
              }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-app-primary mb-1">{item.metric}</div>
                  <div className="text-sm text-app-muted">{item.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-20 h-2 bg-app-tertiary rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-app-muted">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-app-primary">{item.value}</div>
                  <div className="text-sm text-app-muted">shares</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Optimization Tips</h4>
          <div className="space-y-4">
            {[
              {
                tip: 'Optimize for Mobile Sharing',
                reason: `${((shareData.twitter + shareData.facebook) / analytics.total_shares * 100).toFixed(0)}% mobile-first platforms`,
                priority: 'High',
                icon: Smartphone
              },
              {
                tip: 'Add Social Media Cards',
                reason: 'Improve preview quality on platforms',
                priority: 'Medium',
                icon: MessageCircle
              },
              {
                tip: 'Encourage Copy-Link Shares',
                reason: `${(shareData.copy_link / analytics.total_shares * 100).toFixed(0)}% current rate - increase to 30%+`,
                priority: viralMetrics.share_to_conversion < 0.3 ? 'High' : 'Low',
                icon: Link
              },
              {
                tip: 'A/B Test Share Copy',
                reason: 'Optimize viral coefficient beyond ' + viralMetrics.reach_multiplier.toFixed(1),
                priority: 'Medium',
                icon: TrendingUp
              }
            ].map((item, index) => (
              <div key={index} className="p-3 bg-app-surface rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.priority === 'High' ? 'bg-cotton-pink bg-opacity-20' :
                    item.priority === 'Medium' ? 'bg-cotton-blue bg-opacity-20' :
                    'bg-cotton-mint bg-opacity-20'
                  }`}>
                    <item.icon className={`w-4 h-4 ${
                      item.priority === 'High' ? 'text-cotton-pink' :
                      item.priority === 'Medium' ? 'text-cotton-blue' :
                      'text-cotton-mint'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-app-primary">{item.tip}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.priority === 'High' ? 'bg-cotton-pink bg-opacity-20 text-cotton-pink' :
                        item.priority === 'Medium' ? 'bg-cotton-blue bg-opacity-20 text-cotton-blue' :
                        'bg-cotton-mint bg-opacity-20 text-cotton-mint'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-sm text-app-muted">{item.reason}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareAnalytics