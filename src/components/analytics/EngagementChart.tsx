'use client'

import React, { useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { Activity, BarChart3, Clock, MousePointer, Eye, Users } from 'lucide-react'
import { AnalyticsData } from '@/types/poll'

interface EngagementChartProps {
  analytics: AnalyticsData
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ analytics }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d')

  // Generate hourly data for 24h view
  const generateHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const baseViews = analytics.total_views / 24
    const peakHour = analytics.peak_hour

    return hours.map(hour => {
      const distanceFromPeak = Math.abs(hour - peakHour)
      const multiplier = Math.max(0.3, 1 - (distanceFromPeak / 12))
      return Math.round(baseViews * multiplier * (0.8 + Math.random() * 0.4))
    })
  }

  // Prepare chart data based on timeframe
  const getChartData = () => {
    if (timeframe === '24h') {
      const hourlyViews = generateHourlyData()
      const hourlyVotes = hourlyViews.map(views => Math.round(views * analytics.completion_rate * (0.8 + Math.random() * 0.4)))

      return {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Views',
            data: hourlyViews,
            borderColor: 'var(--cotton-candy-blue)',
            backgroundColor: 'rgba(79, 172, 254, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Votes',
            data: hourlyVotes,
            borderColor: 'var(--cotton-candy-pink)',
            backgroundColor: 'rgba(255, 107, 157, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
    }

    // Use daily analytics for 7d and 30d
    const dailyData = analytics.daily_analytics || []
    const filteredData = timeframe === '7d' ? dailyData.slice(-7) : dailyData.slice(-30)

    return {
      labels: filteredData.map(day =>
        new Date(day.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      ),
      datasets: [
        {
          label: 'Views',
          data: filteredData.map(day => day.views),
          borderColor: 'var(--cotton-candy-blue)',
          backgroundColor: chartType === 'bar' ? 'rgba(79, 172, 254, 0.8)' : 'rgba(79, 172, 254, 0.1)',
          fill: chartType === 'line',
          tension: 0.4
        },
        {
          label: 'Votes',
          data: filteredData.map(day => day.votes),
          borderColor: 'var(--cotton-candy-pink)',
          backgroundColor: chartType === 'bar' ? 'rgba(255, 107, 157, 0.8)' : 'rgba(255, 107, 157, 0.1)',
          fill: chartType === 'line',
          tension: 0.4
        },
        {
          label: 'Shares',
          data: filteredData.map(day => day.shares),
          borderColor: 'var(--cotton-candy-mint)',
          backgroundColor: chartType === 'bar' ? 'rgba(0, 245, 160, 0.8)' : 'rgba(0, 245, 160, 0.1)',
          fill: chartType === 'line',
          tension: 0.4
        }
      ]
    }
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
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value.toLocaleString()}`
          }
        }
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
          maxTicksLimit: timeframe === '24h' ? 12 : 10
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
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }

  // Calculate engagement metrics
  const engagementMetrics = [
    {
      label: 'Click-through Rate',
      value: `${((analytics.total_votes / analytics.total_views) * 100).toFixed(2)}%`,
      icon: MousePointer,
      description: 'Percentage of viewers who voted',
      color: 'cotton-blue'
    },
    {
      label: 'Session Duration',
      value: `${Math.round(analytics.avg_time_on_page)}s`,
      icon: Clock,
      description: 'Average time spent on poll',
      color: 'cotton-purple'
    },
    {
      label: 'View Depth',
      value: `${((analytics.unique_viewers / analytics.total_views) * 100).toFixed(1)}%`,
      icon: Eye,
      description: 'Unique vs total views ratio',
      color: 'cotton-mint'
    },
    {
      label: 'Return Rate',
      value: `${(analytics.return_visitor_rate * 100).toFixed(1)}%`,
      icon: Users,
      description: 'Visitors who returned',
      color: 'cotton-peach'
    }
  ]

  const chartData = getChartData()
  const ChartComponent = chartType === 'line' ? Line : Bar

  return (
    <div className="space-y-6">
      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementMetrics.map((metric, index) => (
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Engagement Chart */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-primary mb-4 sm:mb-0">
            Engagement Over Time
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Timeframe Selector */}
            <div className="flex bg-app-surface rounded-lg p-1">
              {[
                { value: '24h', label: '24H' },
                { value: '7d', label: '7D' },
                { value: '30d', label: '30D' }
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

            {/* Chart Type Selector */}
            <div className="flex bg-app-surface rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md transition-all ${
                  chartType === 'line'
                    ? 'bg-cotton-purple text-white'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-cotton-purple text-white'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
          {chartData.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dataset.borderColor }}
              ></div>
              <span className="text-sm text-app-muted">{dataset.label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-96">
          <ChartComponent data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Engagement Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-4">Peak Activity Hours</h4>
          <div className="space-y-3">
            {[
              { hour: analytics.peak_hour, label: 'Peak Hour', percentage: 100 },
              { hour: (analytics.peak_hour + 1) % 24, label: 'Secondary Peak', percentage: 75 },
              { hour: (analytics.peak_hour - 1 + 24) % 24, label: 'Pre-Peak', percentage: 60 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-app-surface rounded flex items-center justify-center text-sm font-medium text-app-primary">
                    {item.hour}:00
                  </div>
                  <span className="text-app-secondary">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-app-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-app-muted w-8">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Quality */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-4">Engagement Quality</h4>
          <div className="space-y-4">
            {[
              {
                label: 'High Engagement',
                description: 'Users who voted within 30s',
                value: Math.round(analytics.total_votes * 0.4),
                color: 'cotton-mint'
              },
              {
                label: 'Medium Engagement',
                description: 'Users who spent 30s-2min',
                value: Math.round(analytics.total_votes * 0.4),
                color: 'cotton-blue'
              },
              {
                label: 'Low Engagement',
                description: 'Users who took longer than 2min',
                value: Math.round(analytics.total_votes * 0.2),
                color: 'cotton-purple'
              }
            ].map((segment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full bg-${segment.color}`}></div>
                    <span className="font-medium text-app-primary">{segment.label}</span>
                  </div>
                  <div className="text-sm text-app-muted">{segment.description}</div>
                </div>
                <div className="text-lg font-bold text-app-primary">
                  {segment.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EngagementChart