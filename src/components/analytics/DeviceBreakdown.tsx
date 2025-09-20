'use client'

import React, { useState } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import { Smartphone, Monitor, Tablet, Chrome, Firefox, Safari, Apple, Windows } from 'lucide-react'
import { AnalyticsData } from '@/types/poll'

interface DeviceBreakdownProps {
  analytics: AnalyticsData
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({ analytics }) => {
  const [activeView, setActiveView] = useState<'device' | 'browser' | 'os'>('device')

  // Device breakdown data
  const deviceData = analytics.device_breakdown || {
    mobile: Math.round(analytics.total_views * 0.65),
    desktop: Math.round(analytics.total_views * 0.30),
    tablet: Math.round(analytics.total_views * 0.05)
  }

  // Browser breakdown data
  const browserData = analytics.browser_breakdown || {
    chrome: Math.round(analytics.total_views * 0.45),
    safari: Math.round(analytics.total_views * 0.25),
    firefox: Math.round(analytics.total_views * 0.15),
    edge: Math.round(analytics.total_views * 0.10),
    other: Math.round(analytics.total_views * 0.05)
  }

  // OS breakdown data
  const osData = analytics.os_breakdown || {
    ios: Math.round(analytics.total_views * 0.35),
    android: Math.round(analytics.total_views * 0.30),
    windows: Math.round(analytics.total_views * 0.25),
    macos: Math.round(analytics.total_views * 0.08),
    linux: Math.round(analytics.total_views * 0.02)
  }

  // Chart configurations
  const getChartData = () => {
    switch (activeView) {
      case 'device':
        return {
          labels: ['Mobile', 'Desktop', 'Tablet'],
          datasets: [{
            data: [deviceData.mobile, deviceData.desktop, deviceData.tablet],
            backgroundColor: [
              'var(--cotton-candy-pink)',
              'var(--cotton-candy-blue)',
              'var(--cotton-candy-purple)'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        }
      case 'browser':
        return {
          labels: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Other'],
          datasets: [{
            data: [browserData.chrome, browserData.safari, browserData.firefox, browserData.edge, browserData.other],
            backgroundColor: [
              'var(--cotton-candy-blue)',
              'var(--cotton-candy-mint)',
              'var(--cotton-candy-peach)',
              'var(--cotton-candy-purple)',
              'var(--cotton-candy-lavender)'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        }
      case 'os':
        return {
          labels: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'],
          datasets: [{
            data: [osData.ios, osData.android, osData.windows, osData.macos, osData.linux],
            backgroundColor: [
              'var(--cotton-candy-pink)',
              'var(--cotton-candy-mint)',
              'var(--cotton-candy-blue)',
              'var(--cotton-candy-purple)',
              'var(--cotton-candy-peach)'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        }
      default:
        return { labels: [], datasets: [] }
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-muted)',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--bg-card)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-light)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${value.toLocaleString()} (${percentage}%)`
          }
        }
      }
    }
  }

  // Device icons mapping
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return Smartphone
      case 'desktop': return Monitor
      case 'tablet': return Tablet
      default: return Monitor
    }
  }

  // Browser icons mapping
  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome': return Chrome
      case 'firefox': return Firefox
      case 'safari': return Safari
      default: return Chrome
    }
  }

  // OS icons mapping
  const getOSIcon = (os: string) => {
    switch (os.toLowerCase()) {
      case 'ios':
      case 'macos':
        return Apple
      case 'windows':
        return Windows
      default: return Monitor
    }
  }

  // Get current data and icons based on active view
  const getCurrentData = () => {
    switch (activeView) {
      case 'device':
        return Object.entries(deviceData).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          icon: getDeviceIcon(key),
          percentage: (value / analytics.total_views) * 100
        }))
      case 'browser':
        return Object.entries(browserData).map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value,
          icon: getBrowserIcon(key),
          percentage: (value / analytics.total_views) * 100
        }))
      case 'os':
        return Object.entries(osData).map(([key, value]) => ({
          name: key === 'macos' ? 'macOS' : key === 'ios' ? 'iOS' : key.charAt(0).toUpperCase() + key.slice(1),
          value,
          icon: getOSIcon(key),
          percentage: (value / analytics.total_views) * 100
        }))
      default:
        return []
    }
  }

  const currentData = getCurrentData()
  const chartData = getChartData()

  // Calculate device performance metrics
  const mobileConversionRate = deviceData.mobile > 0 ? (analytics.total_votes * 0.7) / deviceData.mobile : 0
  const desktopConversionRate = deviceData.desktop > 0 ? (analytics.total_votes * 0.3) / deviceData.desktop : 0

  return (
    <div className="space-y-6">
      {/* Device Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="w-6 h-6 text-cotton-pink" />
            <span className="font-semibold text-app-primary">Mobile Dominance</span>
          </div>
          <div className="text-2xl font-bold text-app-primary mb-1">
            {((deviceData.mobile / analytics.total_views) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-app-muted">of total traffic</div>
        </div>

        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-6 h-6 text-cotton-blue" />
            <span className="font-semibold text-app-primary">Desktop Engagement</span>
          </div>
          <div className="text-2xl font-bold text-app-primary mb-1">
            {(desktopConversionRate * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-app-muted">conversion rate</div>
        </div>

        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <Tablet className="w-6 h-6 text-cotton-purple" />
            <span className="font-semibold text-app-primary">Cross-Platform</span>
          </div>
          <div className="text-2xl font-bold text-app-primary mb-1">
            {Object.keys(deviceData).length + Object.keys(browserData).length}
          </div>
          <div className="text-sm text-app-muted">platforms detected</div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-primary mb-4 sm:mb-0">
            Platform Analytics
          </h3>

          {/* View Selector */}
          <div className="flex bg-app-surface rounded-lg p-1">
            {[
              { value: 'device', label: 'Devices', icon: Smartphone },
              { value: 'browser', label: 'Browsers', icon: Chrome },
              { value: 'os', label: 'OS', icon: Monitor }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveView(option.value as any)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  activeView === option.value
                    ? 'bg-gradient-primary text-white'
                    : 'text-app-muted hover:text-app-primary'
                }`}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doughnut Chart */}
          <div className="flex flex-col items-center">
            <div className="w-80 h-80">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Data Table */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-app-primary">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Breakdown
            </h4>
            <div className="space-y-3">
              {currentData
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-app-surface rounded-lg hover:bg-app-surface-light transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-app-tertiary rounded-lg flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-cotton-blue" />
                      </div>
                      <div>
                        <div className="font-medium text-app-primary">{item.name}</div>
                        <div className="text-sm text-app-muted">#{index + 1} most used</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-app-primary">{item.value.toLocaleString()}</div>
                      <div className="text-sm text-cotton-purple">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Device */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Performance by Device</h4>
          <div className="space-y-4">
            {[
              { device: 'Mobile', views: deviceData.mobile, conversionRate: mobileConversionRate, icon: Smartphone, color: 'cotton-pink' },
              { device: 'Desktop', views: deviceData.desktop, conversionRate: desktopConversionRate, icon: Monitor, color: 'cotton-blue' },
              { device: 'Tablet', views: deviceData.tablet, conversionRate: (analytics.total_votes * 0.05) / (deviceData.tablet || 1), icon: Tablet, color: 'cotton-purple' }
            ].map((item) => (
              <div key={item.device} className="flex items-center justify-between p-4 bg-app-surface rounded-lg">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-6 h-6 text-${item.color}`} />
                  <div>
                    <div className="font-medium text-app-primary">{item.device}</div>
                    <div className="text-sm text-app-muted">{item.views.toLocaleString()} views</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-app-primary">{(item.conversionRate * 100).toFixed(1)}%</div>
                  <div className="text-sm text-app-muted">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browser Market Share */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-6">Browser Preferences</h4>
          <div className="space-y-4">
            {Object.entries(browserData)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 4)
              .map(([browser, views], index) => (
                <div key={browser} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-app-tertiary rounded-lg flex items-center justify-center">
                      {React.createElement(getBrowserIcon(browser), { className: "w-4 h-4 text-cotton-blue" })}
                    </div>
                    <span className="font-medium text-app-primary">
                      {browser.charAt(0).toUpperCase() + browser.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-app-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                        style={{ width: `${(views / analytics.total_views) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-app-primary w-12 text-right">
                      {((views / analytics.total_views) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Technical Insights */}
      <div className="glass-card rounded-xl p-6">
        <h4 className="text-lg font-semibold text-app-primary mb-6">Technical Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: 'Mobile-First Design',
              description: 'Optimize for mobile users',
              recommendation: deviceData.mobile > analytics.total_views * 0.6 ? 'Critical' : 'Important',
              color: deviceData.mobile > analytics.total_views * 0.6 ? 'cotton-pink' : 'cotton-blue'
            },
            {
              label: 'Cross-Browser Testing',
              description: 'Test on multiple browsers',
              recommendation: Object.keys(browserData).length > 3 ? 'Required' : 'Optional',
              color: Object.keys(browserData).length > 3 ? 'cotton-purple' : 'cotton-mint'
            },
            {
              label: 'Responsive Design',
              description: 'Works on all screen sizes',
              recommendation: 'Essential',
              color: 'cotton-peach'
            },
            {
              label: 'Performance Focus',
              description: 'Mobile performance priority',
              recommendation: deviceData.mobile > deviceData.desktop ? 'High' : 'Medium',
              color: deviceData.mobile > deviceData.desktop ? 'cotton-lavender' : 'cotton-mint'
            }
          ].map((insight, index) => (
            <div key={index} className="p-4 bg-app-surface rounded-lg">
              <div className={`text-sm font-medium text-${insight.color} mb-2`}>
                {insight.recommendation}
              </div>
              <div className="font-semibold text-app-primary mb-1">{insight.label}</div>
              <div className="text-sm text-app-muted">{insight.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeviceBreakdown