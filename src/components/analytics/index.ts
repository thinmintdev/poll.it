// Performance-optimized exports for analytics components
// Use lazy loading for better bundle splitting

import { lazy } from 'react';

// Main dashboard component (existing)
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

// Individual chart components with lazy loading
export const LazyChart = lazy(() => import('./LazyChart'));
export const AdvancedDoughnutChart = lazy(() => import('./AdvancedDoughnutChart'));
export const TimeSeriesChart = lazy(() => import('./TimeSeriesChart'));
export const BarChart = lazy(() => import('./BarChart'));
export const GeographicHeatMap = lazy(() => import('./GeographicHeatMap'));
export const SimpleMap = lazy(() => import('./SimpleMap'));

// Utility components
export { default as ExportUtility } from './ExportUtility';
export { ChartSkeleton } from './LazyChart';

// Existing components (keep for backward compatibility)
export { AnalyticsOverview } from './AnalyticsOverview';
export { EngagementChart } from './EngagementChart';
export { GeographicMap } from './GeographicMap';
export { DeviceBreakdown } from './DeviceBreakdown';
export { ShareAnalytics } from './ShareAnalytics';
export { ExportModal } from './ExportModal';
export { DateRangeSelector } from './DateRangeSelector';
export { LoadingSkeleton } from './LoadingSkeleton';

// Re-export types for convenience
export type {
  ChartDataPoint,
  TimeSeriesDataPoint,
  GeographicDataPoint,
  AnalyticsData,
  ChartTheme,
  ChartOptions,
  ExportOptions,
  MapOptions,
  PerformanceMetrics,
} from '@/types/analytics';

// Re-export utility functions
export {
  formatNumber,
  formatDate,
  processChartData,
  processTimeSeriesData,
  processGeographicData,
  validateChartData,
  validateTimeSeriesData,
  prepareDataForExport,
  PerformanceMonitor,
} from '@/lib/analytics-utils';

// Re-export theme utilities
export {
  COTTON_CANDY_COLORS,
  CHART_THEMES,
  DEFAULT_CHART_OPTIONS,
  createChartConfig,
  getChartColors,
  getCachedColors,
} from '@/lib/chart-themes';