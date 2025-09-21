'use client'

import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

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

// Define time range type
type TimeRange = 'today' | 'week' | 'month' | 'all';

interface PollAnalyticsData {
  poll_id: string;
  question: string;
  total_views: number;
  unique_viewers: number;
  total_votes: number;
  total_shares: number;
  completion_rate: number;
  bounce_rate: number;
  viral_coefficient: number;
  share_to_vote_ratio: number;
  avg_time_on_page: number;
  avg_time_to_vote: number;
  return_visitor_rate: number;
  interaction_rate: number;
  device_breakdown: Record<string, number>;
  browser_breakdown: Record<string, number>;
  os_breakdown: Record<string, number>;
  share_breakdown: Record<string, number>;
  top_countries: string[];
  analytics_updated_at: string;
}

interface Props {
  pollId: string;
  analytics: PollAnalyticsData;
}

const PollAnalyticsDashboard: React.FC<Props> = ({ pollId, analytics }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [loading, setLoading] = useState(false);

  // Color schemes for charts
  const colors = {
    primary: ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B'],
    background: ['rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(239, 68, 68, 0.2)', 'rgba(16, 185, 129, 0.2)', 'rgba(245, 158, 11, 0.2)']
  };

  // Calculate engagement metrics
  const engagementMetrics = [
    {
      label: 'Total Views',
      value: analytics.total_views?.toLocaleString() || '0',
      icon: '👀',
      color: 'text-blue-600'
    },
    {
      label: 'Total Votes',
      value: analytics.total_votes?.toLocaleString() || '0',
      icon: '🗳️',
      color: 'text-green-600'
    },
    {
      label: 'Completion Rate',
      value: `${(analytics.completion_rate * 100 || 0).toFixed(1)}%`,
      icon: '✅',
      color: 'text-purple-600'
    },
    {
      label: 'Total Shares',
      value: analytics.total_shares?.toLocaleString() || '0',
      icon: '📤',
      color: 'text-orange-600'
    }
  ];

  // Calculate performance metrics
  const performanceMetrics = [
    {
      label: 'Bounce Rate',
      value: `${(analytics.bounce_rate * 100 || 0).toFixed(1)}%`,
      icon: '🔄'
    },
    {
      label: 'Avg. Time on Page',
      value: `${(analytics.avg_time_on_page || 0).toFixed(1)}s`,
      icon: '⏱️'
    },
    {
      label: 'Share to Vote Ratio',
      value: (analytics.share_to_vote_ratio || 0).toFixed(2),
      icon: '📊'
    },
    {
      label: 'Viral Coefficient',
      value: (analytics.viral_coefficient || 0).toFixed(2),
      icon: '🚀'
    }
  ];

  // Process device breakdown data for chart
  const deviceChartData = {
    labels: Object.keys(analytics.device_breakdown || {}),
    datasets: [
      {
        data: Object.values(analytics.device_breakdown || {}),
        backgroundColor: colors.primary.slice(0, Object.keys(analytics.device_breakdown || {}).length),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Process share breakdown data for chart
  const shareChartData = {
    labels: Object.keys(analytics.share_breakdown || {}),
    datasets: [
      {
        data: Object.values(analytics.share_breakdown || {}),
        backgroundColor: colors.primary.slice(0, Object.keys(analytics.share_breakdown || {}).length),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  // Refresh analytics data when time range changes
  useEffect(() => {
    // This would typically fetch new data based on the time range
    // For now, we'll just simulate loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
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
            <div key={`perf-${index}`} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
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