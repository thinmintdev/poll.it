'use client';

import { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { createChartConfig, getCachedColors } from '@/lib/chart-themes';
import { formatNumber, PerformanceMonitor } from '@/lib/analytics-utils';
import { ChartDataPoint } from '@/types/analytics';
import classNames from 'classnames';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  theme?: 'cotton-candy' | 'dark' | 'light';
  orientation?: 'vertical' | 'horizontal';
  showValues?: boolean;
  animate?: boolean;
  height?: number;
  className?: string;
  onError?: (error: Error) => void;
  onDataClick?: (dataPoint: ChartDataPoint, index: number) => void;
}

const BarChart = memo<BarChartProps>(({
  data,
  title,
  theme = 'cotton-candy',
  orientation = 'vertical',
  showValues = true,
  animate = true,
  height = 400,
  className = '',
  onError,
  onDataClick,
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  // Memoized chart data
  const chartData = useMemo((): ChartData<'bar'> => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    performanceMonitor.startTimer('dataProcessingTime');

    const colors = getCachedColors(data.length, theme, 'primary');
    const backgroundColors = colors;
    const borderColors = colors.map(color =>
      color.replace(')', ', 0.8)').replace('rgb', 'rgba')
    );

    const result = {
      labels: data.map(item => item.label),
      datasets: [
        {
          label: title || 'Data',
          data: data.map(item => item.value),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          hoverBackgroundColor: colors.map(color =>
            color.replace(')', ', 0.9)').replace('rgb', 'rgba')
          ),
          hoverBorderWidth: 3,
        },
      ],
    };

    performanceMonitor.endTimer('dataProcessingTime');
    return result;
  }, [data, theme, title, performanceMonitor]);

  // Memoized chart options
  const chartOptions = useMemo((): ChartOptions<'bar'> => {
    const baseOptions = createChartConfig('bar', theme, {
      responsive: true,
      maintainAspectRatio: false,
      animations: animate,
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        format: 'value',
      },
    });

    const isHorizontal = orientation === 'horizontal';

    return {
      ...baseOptions,
      indexAxis: isHorizontal ? 'y' : 'x',
      onClick: (event, elements) => {
        if (elements.length > 0 && onDataClick) {
          const index = elements[0].index;
          const dataPoint = data[index];
          if (dataPoint) {
            onDataClick(dataPoint, index);
          }
        }
      },
      scales: {
        x: {
          ...baseOptions.scales?.x,
          beginAtZero: !isHorizontal,
          ticks: {
            ...baseOptions.scales?.x?.ticks,
            maxRotation: isHorizontal ? 0 : 45,
            callback: isHorizontal ? function(value) {
              return formatNumber(value as number, 'compact');
            } : undefined,
          },
        },
        y: {
          ...baseOptions.scales?.y,
          beginAtZero: isHorizontal,
          ticks: {
            ...baseOptions.scales?.y?.ticks,
            callback: !isHorizontal ? function(value) {
              return formatNumber(value as number, 'compact');
            } : undefined,
          },
        },
      },
      plugins: {
        ...baseOptions.plugins,
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          callbacks: {
            title: (context) => {
              return context[0].label;
            },
            label: (context) => {
              const value = context.raw as number;
              return `${context.dataset.label}: ${formatNumber(value)}`;
            },
          },
        },
        datalabels: showValues ? {
          display: true,
          color: 'white',
          font: {
            weight: 'bold' as const,
            size: 12,
          },
          formatter: (value: number) => {
            return formatNumber(value, 'compact');
          },
          anchor: 'center' as const,
          align: 'center' as const,
        } : {
          display: false,
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    } as ChartOptions<'bar'>;
  }, [theme, animate, orientation, showValues, onDataClick, data]);

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
        <Bar
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* Top performers */}
      {data.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-app-secondary mb-2">
            Top {Math.min(5, data.length)} Items
          </h4>
          <div className="space-y-2">
            {data
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map((item, index) => {
                const colors = getCachedColors(data.length, theme, 'primary');
                const originalIndex = data.findIndex(d => d.label === item.label);
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-2 rounded bg-app-tertiary hover:bg-app-surface-light transition-colors cursor-pointer"
                    onClick={() => onDataClick?.(item, originalIndex)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors[originalIndex] }}
                      ></div>
                      <span className="text-sm text-app-secondary">{item.label}</span>
                    </div>
                    <div className="text-sm font-medium text-app-primary">
                      {formatNumber(item.value)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Chart controls */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="btn-secondary text-xs"
          onClick={() => {
            // Toggle orientation (would require state management in parent)
            console.log('Toggle orientation');
          }}
        >
          {orientation === 'vertical' ? 'Horizontal' : 'Vertical'} View
        </button>
        <button
          className="btn-secondary text-xs"
          onClick={() => {
            // Sort data (would require state management in parent)
            console.log('Sort data');
          }}
        >
          Sort by Value
        </button>
      </div>
    </div>
  );
});

BarChart.displayName = 'BarChart';

export default BarChart;