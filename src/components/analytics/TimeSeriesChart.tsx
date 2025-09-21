'use client';

import { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  LinearScaleOptions,
  CategoryScaleOptions,
  TooltipItem,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { getCachedColors, getGradientColors } from '@/lib/chart-themes';
import { formatNumber, formatDate, PerformanceMonitor } from '@/lib/analytics-utils';
import { TimeSeriesDataPoint } from '@/types/analytics';
import classNames from 'classnames';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  theme?: 'cotton-candy' | 'dark' | 'light';
  showArea?: boolean;
  showPoints?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  height?: number;
  dateFormat?: string;
  className?: string;
  onError?: (error: Error) => void;
  onDataClick?: (dataPoint: TimeSeriesDataPoint, index: number) => void;
}

// Chart context interface for gradient creation
interface ChartContext {
  chart: ChartJS;
  ctx: CanvasRenderingContext2D;
  chartArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Background color function type
type BackgroundColorFunction = (context: ChartContext) => string | CanvasGradient;

const TimeSeriesChart = memo<TimeSeriesChartProps>(({
  data,
  title,
  theme = 'cotton-candy',
  showArea = true,
  showPoints = true,
  showGrid = true,
  animate = true,
  height = 400,
  dateFormat = 'MMM dd',
  className = '',
  onError,
  onDataClick,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  // Memoized chart data
  const chartData = useMemo((): ChartData<'line'> => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    performanceMonitor.startTimer('dataProcessingTime');

    // Sort data by date
    const sortedData = [...data].sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return dateA.getTime() - dateB.getTime();
    });

    const labels = sortedData.map(item => {
      const date = typeof item.date === 'string' ? new Date(item.date) : item.date;
      return formatDate(date, dateFormat);
    });

    const values = sortedData.map(item => item.value);
    const colors = getCachedColors(1, theme, 'primary');
    const primaryColor = colors[0];

    // Create gradient for area fill
    const createGradient = (ctx: CanvasRenderingContext2D, chartArea: ChartContext['chartArea']): CanvasGradient => {
      return getGradientColors(ctx, chartArea, [
        primaryColor.replace(')', ', 0.3)').replace('rgb', 'rgba'),
        primaryColor.replace(')', ', 0.0)').replace('rgb', 'rgba'),
      ]);
    };

    const backgroundColorFunction: BackgroundColorFunction = (context: ChartContext) => {
      const chart = context.chart;
      const { ctx, chartArea } = chart;
      if (!chartArea) return 'transparent';
      return createGradient(ctx, chartArea);
    };

    const result = {
      labels,
      datasets: [
        {
          label: title || 'Data',
          data: values,
          borderColor: primaryColor,
          backgroundColor: showArea ? backgroundColorFunction : 'transparent',
          borderWidth: 3,
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: showPoints ? 4 : 0,
          pointHoverRadius: showPoints ? 6 : 0,
          tension: 0.4,
          fill: showArea,
          spanGaps: true,
        },
      ],
    };

    performanceMonitor.endTimer('dataProcessingTime');
    return result;
  }, [data, theme, showArea, showPoints, title, dateFormat, performanceMonitor]);

  // Memoized chart options
  const chartOptions = useMemo((): ChartOptions<'line'> => {
    // Create properly typed scales configuration
    const xScale: CategoryScaleOptions = {
      type: 'category',
      grid: {
        display: showGrid,
        color: 'var(--border-light)',
      },
      ticks: {
        maxTicksLimit: 8,
        maxRotation: 45,
        color: 'var(--text-secondary)',
      },
    };

    const yScale: LinearScaleOptions = {
      type: 'linear',
      beginAtZero: true,
      grid: {
        display: showGrid,
        color: 'var(--border-light)',
      },
      ticks: {
        callback: function(value: string | number): string {
          return formatNumber(value as number, 'compact');
        },
        color: 'var(--text-secondary)',
      },
    };

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: animate ? {
        duration: 800,
        easing: 'easeInOutCubic',
      } : false,
      onClick: (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0 && onDataClick) {
          const index = elements[0].index;
          const dataPoint = data[index];
          if (dataPoint) {
            onDataClick(dataPoint, index);
          }
        }
      },
      scales: {
        x: xScale,
        y: yScale,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'var(--border-light)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context: TooltipItem<'line'>[]) => {
              return context[0].label;
            },
            label: (context: TooltipItem<'line'>) => {
              const value = context.raw as number;
              return `${context.dataset.label}: ${formatNumber(value)}`;
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    };
  }, [theme, animate, showGrid, onDataClick, data]);

  // Chart initialization effect
  useEffect(() => {
    const initChart = async () => {
      try {
        performanceMonitor.startTimer('chartInitializationTime');
        setIsLoading(true);

        // Simulate minimum loading time for smooth UX
        await new Promise(resolve => setTimeout(resolve, 100));

        performanceMonitor.endTimer('chartInitializationTime');
        setIsLoading(false);
      } catch (error) {
        console.error('Chart initialization error:', error);
        onError?.(error as Error);
        setIsLoading(false);
      }
    };

    initChart();
  }, [data, performanceMonitor, onError]);

  // Performance monitoring effect
  useEffect(() => {
    performanceMonitor.startTimer('renderTime');
    return () => {
      performanceMonitor.endTimer('renderTime');
      if (process.env.NODE_ENV === 'development') {
        performanceMonitor.logMetrics();
      }
    };
  }, [performanceMonitor]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map(item => item.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return { total, average, max, min };
  }, [data]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.resize();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  if (isLoading) {
    return (
      <div className={classNames('animate-pulse', className)}>
        <div className="bg-app-surface rounded-lg p-6">
          {title && <div className="h-6 bg-app-surface-light rounded w-1/3 mb-4"></div>}
          <div className="h-64 bg-app-surface-light rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={classNames('bg-app-surface rounded-lg p-6 text-center', className)}>
        <div className="text-app-muted">No data available</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={classNames('bg-app-surface rounded-lg p-6', className)}
    >
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-app-primary">{title}</h3>
          {stats && (
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-app-muted">
              <span>Total: {formatNumber(stats.total)}</span>
              <span>Avg: {formatNumber(stats.average)}</span>
              <span>Max: {formatNumber(stats.max)}</span>
              <span>Min: {formatNumber(stats.min)}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ height: `${height}px` }} className="relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* Data controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn-secondary text-xs"
          onClick={() => {
            // Toggle area fill
            if (chartRef.current) {
              const dataset = chartRef.current.data.datasets[0];
              dataset.fill = !dataset.fill;
              chartRef.current.update();
            }
          }}
        >
          {showArea ? 'Hide' : 'Show'} Area
        </button>
        <button
          className="btn-secondary text-xs"
          onClick={() => {
            // Toggle points
            if (chartRef.current) {
              const dataset = chartRef.current.data.datasets[0];
              dataset.pointRadius = dataset.pointRadius === 0 ? 4 : 0;
              dataset.pointHoverRadius = dataset.pointHoverRadius === 0 ? 6 : 0;
              chartRef.current.update();
            }
          }}
        >
          {showPoints ? 'Hide' : 'Show'} Points
        </button>
      </div>
    </div>
  );
});

TimeSeriesChart.displayName = 'TimeSeriesChart';

export default TimeSeriesChart;