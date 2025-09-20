'use client';

import { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
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
ChartJS.register(ArcElement, Tooltip, Legend);

interface AdvancedDoughnutChartProps {
  data: ChartDataPoint[];
  title?: string;
  theme?: 'cotton-candy' | 'dark' | 'light';
  showPercentages?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  height?: number;
  className?: string;
  onError?: (error: Error) => void;
  onDataClick?: (dataPoint: ChartDataPoint, index: number) => void;
}

const AdvancedDoughnutChart = memo<AdvancedDoughnutChartProps>(({
  data,
  title,
  theme = 'cotton-candy',
  showPercentages = true,
  showValues = true,
  showLegend = true,
  animate = true,
  height = 400,
  className = '',
  onError,
  onDataClick,
}) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const performanceMonitor = useMemo(() => new PerformanceMonitor(), []);

  // Memoized chart data
  const chartData = useMemo((): ChartData<'doughnut'> => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    performanceMonitor.startTimer('dataProcessingTime');

    const colors = getCachedColors(data.length, theme, 'primary');
    const backgroundColors = colors;
    const borderColors = colors.map(color => color.replace(')', ', 0.8)').replace('rgb', 'rgba'));

    const result = {
      labels: data.map(item => item.label),
      datasets: [
        {
          data: data.map(item => item.value),
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverBackgroundColor: colors.map(color =>
            color.replace(')', ', 0.9)').replace('rgb', 'rgba')
          ),
          hoverBorderWidth: 3,
          hoverOffset: 4,
        },
      ],
    };

    performanceMonitor.endTimer('dataProcessingTime');
    return result;
  }, [data, theme, performanceMonitor]);

  // Memoized chart options
  const chartOptions = useMemo((): ChartOptions<'doughnut'> => {
    const baseOptions = createChartConfig('doughnut', theme, {
      responsive: true,
      maintainAspectRatio: false,
      animations: animate,
      legend: {
        display: showLegend,
        position: 'bottom',
      },
      tooltip: {
        enabled: true,
        format: showPercentages && showValues ? 'both' :
                showPercentages ? 'percentage' : 'value',
      },
    });

    return {
      ...baseOptions,
      onClick: (event, elements) => {
        if (elements.length > 0 && onDataClick) {
          const index = elements[0].index;
          const dataPoint = data[index];
          if (dataPoint) {
            onDataClick(dataPoint, index);
          }
        }
      },
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins?.legend,
          onClick: (event, legendItem, legend) => {
            // Custom legend click handler
            const index = legendItem.index!;
            const chart = legend.chart;
            const meta = chart.getDatasetMeta(0);

            meta.data[index].hidden = !meta.data[index].hidden;
            chart.update();
          },
        },
        tooltip: {
          ...baseOptions.plugins?.tooltip,
          callbacks: {
            ...baseOptions.plugins?.tooltip?.callbacks,
            afterLabel: (context) => {
              if (showPercentages && showValues) {
                const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
                const percentage = ((context.raw as number / total) * 100).toFixed(1);
                return `${formatNumber(context.raw as number)} (${percentage}%)`;
              }
              return '';
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    } as ChartOptions<'doughnut'>;
  }, [theme, animate, showLegend, showPercentages, showValues, onDataClick, data]);

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

  // Calculate total value
  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
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
          <p className="text-sm text-app-muted">
            Total: {formatNumber(totalValue)} • {data.length} categories
          </p>
        </div>
      )}

      <div style={{ height: `${height}px` }} className="relative">
        <Doughnut
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />

        {/* Center text overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-app-primary">
              {formatNumber(totalValue, 'compact')}
            </div>
            <div className="text-sm text-app-muted">Total</div>
          </div>
        </div>
      </div>

      {/* Data summary */}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {data.slice(0, 8).map((item, index) => {
            const colors = getCachedColors(data.length, theme, 'primary');
            return (
              <div
                key={item.label}
                className="flex items-center space-x-2 p-2 rounded bg-app-tertiary hover:bg-app-surface-light transition-colors cursor-pointer"
                onClick={() => onDataClick?.(item, index)}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index] }}
                ></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-app-secondary truncate">{item.label}</div>
                  <div className="text-sm font-medium text-app-primary">
                    {formatNumber(item.value, 'compact')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

AdvancedDoughnutChart.displayName = 'AdvancedDoughnutChart';

export default AdvancedDoughnutChart;