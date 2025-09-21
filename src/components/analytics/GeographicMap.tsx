'use client'

import React, { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { MapPin, Globe, TrendingUp, Users, Eye } from 'lucide-react'
import { AnalyticsData } from '@/types/poll'
import { TooltipItem } from 'chart.js'

interface GeographicMapProps {
  analytics: AnalyticsData
}

// Type for view selection
type ViewType = 'countries' | 'regions';

// Type for geographic data structure
interface GeographicDataItem {
  country_code: string;
  country_name: string;
  views: number;
  votes: number;
  completion_rate: number;
}

// Type for chart dataset
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

// Type for chart data
interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Type for chart options
interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
    };
    tooltip: {
      backgroundColor: string;
      titleColor: string;
      bodyColor: string;
      borderColor: string;
      borderWidth: number;
      cornerRadius: number;
      callbacks: {
        label: (context: TooltipItem<'bar'>) => string;
      };
    };
  };
  scales: {
    x: {
      grid: {
        color: string;
        drawBorder: boolean;
      };
      ticks: {
        color: string;
        maxRotation: number;
      };
    };
    y: {
      grid: {
        color: string;
        drawBorder: boolean;
      };
      ticks: {
        color: string;
        callback: (value: number | string) => string;
      };
    };
  };
}

export const GeographicMap: React.FC<GeographicMapProps> = ({ analytics }) => {
  const [viewType, setViewType] = useState<ViewType>('countries')

  // Mock geographic data - in a real app this would come from the analytics
  const geographicData: GeographicDataItem[] = analytics.geographic_data || [
    { country_code: 'US', country_name: 'United States', views: Math.round(analytics.total_views * 0.35), votes: Math.round(analytics.total_votes * 0.4), completion_rate: 0.75 },
    { country_code: 'CA', country_name: 'Canada', views: Math.round(analytics.total_views * 0.15), votes: Math.round(analytics.total_votes * 0.18), completion_rate: 0.82 },
    { country_code: 'GB', country_name: 'United Kingdom', views: Math.round(analytics.total_views * 0.12), votes: Math.round(analytics.total_votes * 0.15), completion_rate: 0.78 },
    { country_code: 'DE', country_name: 'Germany', views: Math.round(analytics.total_views * 0.08), votes: Math.round(analytics.total_votes * 0.09), completion_rate: 0.71 },
    { country_code: 'FR', country_name: 'France', views: Math.round(analytics.total_views * 0.06), votes: Math.round(analytics.total_votes * 0.05), completion_rate: 0.68 },
    { country_code: 'AU', country_name: 'Australia', views: Math.round(analytics.total_views * 0.05), votes: Math.round(analytics.total_votes * 0.06), completion_rate: 0.85 },
    { country_code: 'JP', country_name: 'Japan', views: Math.round(analytics.total_views * 0.04), votes: Math.round(analytics.total_votes * 0.03), completion_rate: 0.62 },
    { country_code: 'BR', country_name: 'Brazil', views: Math.round(analytics.total_views * 0.08), votes: Math.round(analytics.total_votes * 0.06), completion_rate: 0.58 },
    { country_code: 'IN', country_name: 'India', views: Math.round(analytics.total_views * 0.07), votes: Math.round(analytics.total_votes * 0.04), completion_rate: 0.48 }
  ]

  // Sort by views and take top 10
  const topCountries = geographicData
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)

  // Prepare chart data
  const chartData: ChartData = {
    labels: topCountries.map(country => country.country_name),
    datasets: [
      {
        label: 'Views',
        data: topCountries.map(country => country.views),
        backgroundColor: 'rgba(79, 172, 254, 0.8)',
        borderColor: 'var(--cotton-candy-blue)',
        borderWidth: 1
      },
      {
        label: 'Votes',
        data: topCountries.map(country => country.votes),
        backgroundColor: 'rgba(255, 107, 157, 0.8)',
        borderColor: 'var(--cotton-candy-pink)',
        borderWidth: 1
      }
    ]
  }

  const chartOptions: ChartOptions = {
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
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
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
          maxRotation: 45
        }
      },
      y: {
        grid: {
          color: 'var(--border)',
          drawBorder: false
        },
        ticks: {
          color: 'var(--text-muted)',
          callback: (value: number | string) => (value as number).toLocaleString()
        }
      }
    }
  }

  // Get flag emoji for country code
  const getFlagEmoji = (countryCode: string): string => {
    const flagMap: Record<string, string> = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'AU': '🇦🇺', 'JP': '🇯🇵', 'BR': '🇧🇷', 'IN': '🇮🇳', 'ES': '🇪🇸',
      'IT': '🇮🇹', 'NL': '🇳🇱', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰'
    }
    return flagMap[countryCode] || '🌍'
  }

  // Calculate regional insights
  const totalInternationalViews = topCountries.slice(1).reduce((sum, country) => sum + country.views, 0)
  const internationalPercentage = (totalInternationalViews / analytics.total_views) * 100

  return (
    <div className="space-y-6">
      {/* Geographic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-6 h-6 text-cotton-blue" />
            <span className="font-semibold text-app-primary">Global Reach</span>
          </div>
          <div className="text-2xl font-bold text-app-primary mb-1">
            {topCountries.length}
          </div>
          <div className="text-sm text-app-muted">Countries with views</div>
        </div>

        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-cotton-purple" />
            <span className="font-semibold text-app-primary">Top Country</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{getFlagEmoji(topCountries[0]?.country_code || '')}</span>
            <div className="text-lg font-bold text-app-primary">
              {topCountries[0]?.country_name || 'N/A'}
            </div>
          </div>
          <div className="text-sm text-app-muted">
            {((topCountries[0]?.views || 0) / analytics.total_views * 100).toFixed(1)}% of total views
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 hover-glow">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-cotton-mint" />
            <span className="font-semibold text-app-primary">International</span>
          </div>
          <div className="text-2xl font-bold text-app-primary mb-1">
            {internationalPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-app-muted">Non-domestic traffic</div>
        </div>
      </div>

      {/* Geographic Chart */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-xl font-semibold text-app-primary mb-4 sm:mb-0">
            Geographic Distribution
          </h3>

          <div className="flex items-center gap-4">
            {/* Chart Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cotton-blue"></div>
                <span className="text-sm text-app-muted">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cotton-pink"></div>
                <span className="text-sm text-app-muted">Votes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Country Details Table */}
      <div className="glass-card rounded-xl p-6">
        <h4 className="text-lg font-semibold text-app-primary mb-6">Country Performance</h4>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-light">
                <th className="text-left py-3 px-4 font-medium text-app-muted">Country</th>
                <th className="text-right py-3 px-4 font-medium text-app-muted">Views</th>
                <th className="text-right py-3 px-4 font-medium text-app-muted">Votes</th>
                <th className="text-right py-3 px-4 font-medium text-app-muted">Completion Rate</th>
                <th className="text-right py-3 px-4 font-medium text-app-muted">Share</th>
              </tr>
            </thead>
            <tbody>
              {topCountries.map((country, index) => (
                <tr
                  key={country.country_code}
                  className="border-b border-app-surface hover:bg-app-surface transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getFlagEmoji(country.country_code)}</span>
                      <div>
                        <div className="font-medium text-app-primary">{country.country_name}</div>
                        <div className="text-sm text-app-muted">#{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-app-primary">{country.views.toLocaleString()}</div>
                    <div className="text-sm text-app-muted">
                      {((country.views / analytics.total_views) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="font-semibold text-app-primary">{country.votes.toLocaleString()}</div>
                    <div className="text-sm text-app-muted">
                      {((country.votes / analytics.total_votes) * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-app-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                          style={{ width: `${country.completion_rate * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-app-primary">
                        {(country.completion_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-app-muted">
                    {((country.views / analytics.total_views) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Regions */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-4">High Engagement Regions</h4>
          <div className="space-y-3">
            {topCountries
              .sort((a, b) => b.completion_rate - a.completion_rate)
              .slice(0, 5)
              .map((country, index) => (
                <div key={country.country_code} className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFlagEmoji(country.country_code)}</span>
                    <div>
                      <div className="font-medium text-app-primary">{country.country_name}</div>
                      <div className="text-sm text-app-muted">{country.votes} votes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cotton-mint">
                      {(country.completion_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-app-muted">completion</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Growth Opportunities */}
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-lg font-semibold text-app-primary mb-4">Growth Opportunities</h4>
          <div className="space-y-3">
            {topCountries
              .filter(country => country.views > 10 && country.completion_rate < 0.6)
              .slice(0, 5)
              .map((country, index) => (
                <div key={country.country_code} className="flex items-center justify-between p-3 bg-app-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFlagEmoji(country.country_code)}</span>
                    <div>
                      <div className="font-medium text-app-primary">{country.country_name}</div>
                      <div className="text-sm text-app-muted">{country.views} views</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-cotton-peach">
                      {(country.completion_rate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-app-muted">potential</div>
                  </div>
                </div>
              ))}
            {topCountries.filter(country => country.views > 10 && country.completion_rate < 0.6).length === 0 && (
              <div className="text-center py-8 text-app-muted">
                <Globe className="w-12 h-12 mx-auto mb-3 text-cotton-purple" />
                <p>All major regions performing well!</p>
              </div>
            )}
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
              recommendation: (topCountries[0]?.views || 0) > analytics.total_views * 0.6 ? 'Critical' : 'Important',
              color: (topCountries[0]?.views || 0) > analytics.total_views * 0.6 ? 'cotton-pink' : 'cotton-blue'
            },
            {
              label: 'Cross-Browser Testing',
              description: 'Test on multiple browsers',
              recommendation: Object.keys(geographicData).length > 3 ? 'Required' : 'Optional',
              color: Object.keys(geographicData).length > 3 ? 'cotton-purple' : 'cotton-mint'
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
              recommendation: (topCountries[0]?.views || 0) > (topCountries[1]?.views || 0) ? 'High' : 'Medium',
              color: (topCountries[0]?.views || 0) > (topCountries[1]?.views || 0) ? 'cotton-lavender' : 'cotton-mint'
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

export default GeographicMap