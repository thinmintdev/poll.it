'use client'

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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
  PointElement
);

interface PollAnalyticsData {
  poll_id: string;
  question: string;
  poll_created_at: string;
  total_views: number;
  unique_viewers: number;
  total_votes: number;
  completion_rate: number;
  total_shares: number;
  share_to_vote_ratio: number;
  avg_time_to_vote: number;
  avg_time_on_page: number;
  top_countries: string[];
  device_breakdown: Record<string, number>;
  share_breakdown: Record<string, number>;
  viral_coefficient: number;
  analytics_updated_at: string;
}

interface PollAnalyticsDashboardProps {
  pollId: string;
  className?: string;
}

export const PollAnalyticsDashboard: React.FC<PollAnalyticsDashboardProps> = ({
  pollId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<PollAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/${pollId}?daily=true`);
        const result = await response.json();

        if (result.success) {
          setAnalytics(result.data);
        } else {
          setError(result.error || 'Failed to fetch analytics');
        }
      } catch (err) {
        setError('Network error while fetching analytics');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (pollId) {
      fetchAnalytics();
    }
  }, [pollId, timeRange]);

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format percentage
  const formatPercentage = (decimal: number) => `${(decimal * 100).toFixed(1)}%`;

  // Format time duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium mb-2">Analytics Unavailable</p>
          <p>{error || 'No analytics data found for this poll'}</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const deviceChartData = {
    labels: Object.keys(analytics.device_breakdown || {}),
    datasets: [{
      data: Object.values(analytics.device_breakdown || {}),
      backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const shareChartData = {
    labels: Object.keys(analytics.share_breakdown || {}),
    datasets: [{
      data: Object.values(analytics.share_breakdown || {}),
      backgroundColor: ['#1DA1F2', '#4267B2', '#0A66C2', '#25D366', '#FF6B35'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const engagementMetrics = [
    {
      label: 'Total Views',
      value: formatNumber(analytics.total_views),
      icon: '👁️',
      color: 'text-blue-600'
    },
    {
      label: 'Unique Viewers',
      value: formatNumber(analytics.unique_viewers),
      icon: '👥',
      color: 'text-green-600'
    },
    {
      label: 'Total Votes',
      value: formatNumber(analytics.total_votes),
      icon: '🗳️',
      color: 'text-purple-600'
    },
    {
      label: 'Completion Rate',
      value: formatPercentage(analytics.completion_rate),
      icon: '✅',
      color: 'text-orange-600'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Avg. Time to Vote',
      value: formatDuration(analytics.avg_time_to_vote),
      icon: '⏱️'
    },
    {
      label: 'Avg. Time on Page',
      value: formatDuration(analytics.avg_time_on_page),
      icon: '📖'
    },
    {
      label: 'Share-to-Vote Ratio',
      value: analytics.share_to_vote_ratio.toFixed(2),
      icon: '📊'
    },
    {
      label: 'Viral Coefficient',
      value: analytics.viral_coefficient.toFixed(2),
      icon: '🚀'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Poll Analytics</h2>
            <p className="text-gray-600 truncate max-w-2xl">{analytics.question}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {engagementMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                </div>
                <span className="text-2xl">{metric.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <span className="text-xl">{metric.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Device Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
            {Object.keys(analytics.device_breakdown || {}).length > 0 ? (
              <div className="h-64">
                <Doughnut
                  data={deviceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No device data available
              </div>
            )}
          </div>

          {/* Share Breakdown */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Platforms</h3>
            {Object.keys(analytics.share_breakdown || {}).length > 0 ? (
              <div className="h-64">
                <Doughnut
                  data={shareChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No sharing data available
              </div>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        {analytics.top_countries && analytics.top_countries.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.top_countries.slice(0, 10).map((country, index) => (
                <span
                  key={country}
                  className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm"
                >
                  {country.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Last updated: {new Date(analytics.analytics_updated_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PollAnalyticsDashboard;