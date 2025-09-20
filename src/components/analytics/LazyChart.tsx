'use client';

import { lazy, Suspense, memo } from 'react';
import type { ComponentType } from 'react';

// Lazy load chart components for better performance
const AdvancedDoughnutChart = lazy(() => import('./AdvancedDoughnutChart'));
const TimeSeriesChart = lazy(() => import('./TimeSeriesChart'));
const GeographicHeatMap = lazy(() => import('./GeographicHeatMap'));
const BarChart = lazy(() => import('./BarChart'));
const SimpleMap = lazy(() => import('./SimpleMap'));

// Loading skeleton component
const ChartSkeleton = memo(() => (
  <div className="animate-pulse">
    <div className="bg-app-surface rounded-lg p-6">
      <div className="h-4 bg-app-surface-light rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-app-surface-light rounded"></div>
      <div className="flex justify-center space-x-2 mt-4">
        <div className="h-3 w-3 bg-cotton-pink rounded-full"></div>
        <div className="h-3 w-3 bg-cotton-blue rounded-full"></div>
        <div className="h-3 w-3 bg-cotton-purple rounded-full"></div>
      </div>
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Error boundary component for chart failures
const ChartErrorBoundary = memo(({ children, fallback }: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const defaultFallback = (
    <div className="bg-app-surface rounded-lg p-6 text-center">
      <div className="text-app-muted mb-2">⚠️ Chart failed to load</div>
      <button
        onClick={() => window.location.reload()}
        className="btn-secondary text-sm"
      >
        Retry
      </button>
    </div>
  );

  return (
    <Suspense fallback={<ChartSkeleton />}>
      {children}
    </Suspense>
  );
});

ChartErrorBoundary.displayName = 'ChartErrorBoundary';

// Chart type definitions
export type ChartType = 'doughnut' | 'timeseries' | 'heatmap' | 'bar' | 'map';

interface LazyChartProps {
  type: ChartType;
  data: any;
  options?: any;
  className?: string;
  loading?: boolean;
  error?: string | null;
  onError?: (error: Error) => void;
}

// Chart component registry
const CHART_COMPONENTS: Record<ChartType, ComponentType<any>> = {
  doughnut: AdvancedDoughnutChart,
  timeseries: TimeSeriesChart,
  heatmap: GeographicHeatMap,
  bar: BarChart,
  map: SimpleMap,
};

// Main lazy chart component
const LazyChart = memo<LazyChartProps>(({
  type,
  data,
  options = {},
  className = '',
  loading = false,
  error = null,
  onError,
}) => {
  // Show loading state
  if (loading) {
    return <ChartSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-app-surface rounded-lg p-6 text-center ${className}`}>
        <div className="text-red-400 mb-2">⚠️ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the appropriate chart component
  const ChartComponent = CHART_COMPONENTS[type];

  if (!ChartComponent) {
    return (
      <div className={`bg-app-surface rounded-lg p-6 text-center ${className}`}>
        <div className="text-app-muted">Unsupported chart type: {type}</div>
      </div>
    );
  }

  return (
    <ChartErrorBoundary>
      <div className={className}>
        <ChartComponent
          data={data}
          options={options}
          onError={onError}
        />
      </div>
    </ChartErrorBoundary>
  );
});

LazyChart.displayName = 'LazyChart';

export default LazyChart;

// Export skeleton for external use
export { ChartSkeleton };