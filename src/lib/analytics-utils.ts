// Analytics data processing and utility functions
import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';
import numbro from 'numbro';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import type {
  ChartDataPoint,
  TimeSeriesDataPoint,
  GeographicDataPoint,
  AnalyticsData,
  PerformanceMetrics,
  VirtualizationOptions,
} from '@/types/analytics';

// Number formatting utilities
export const formatNumber = (value: number, format: 'compact' | 'full' | 'percentage' = 'compact'): string => {
  if (format === 'percentage') {
    return numbro(value).format('0.0%');
  }

  if (format === 'compact') {
    return numbro(value).format('0.0a');
  }

  return numbro(value).format('0,0');
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return numbro(value).formatCurrency({
    currency,
    mantissa: value < 100 ? 2 : 0,
  });
};

// Date formatting utilities
export const formatDate = (date: Date | string, formatStr: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const getDateRange = (days: number = 30): { start: Date; end: Date } => {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days));
  return { start, end };
};

// Data processing utilities
export const processChartData = (
  rawData: any[],
  labelKey: string,
  valueKey: string,
  limit?: number
): ChartDataPoint[] => {
  let processed = rawData.map((item, index) => ({
    label: item[labelKey] || `Item ${index + 1}`,
    value: Number(item[valueKey]) || 0,
  }));

  // Sort by value in descending order
  processed.sort((a, b) => b.value - a.value);

  // Limit results if specified
  if (limit && processed.length > limit) {
    const limited = processed.slice(0, limit - 1);
    const others = processed.slice(limit - 1);
    const othersSum = others.reduce((sum, item) => sum + item.value, 0);

    if (othersSum > 0) {
      limited.push({
        label: 'Others',
        value: othersSum,
      });
    }

    processed = limited;
  }

  // Calculate percentages
  const total = processed.reduce((sum, item) => sum + item.value, 0);
  return processed.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));
};

export const processTimeSeriesData = (
  rawData: any[],
  dateKey: string,
  valueKey: string,
  groupBy: 'hour' | 'day' | 'week' | 'month' = 'day'
): TimeSeriesDataPoint[] => {
  const grouped = rawData.reduce((acc, item) => {
    const date = typeof item[dateKey] === 'string' ? parseISO(item[dateKey]) : item[dateKey];
    let key: string;

    switch (groupBy) {
      case 'hour':
        key = format(date, 'yyyy-MM-dd HH:00');
        break;
      case 'week':
        key = format(date, 'yyyy-\'W\'II');
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }

    if (!acc[key]) {
      acc[key] = { date: key, value: 0, count: 0 };
    }

    acc[key].value += Number(item[valueKey]) || 0;
    acc[key].count += 1;

    return acc;
  }, {} as Record<string, { date: string; value: number; count: number }>);

  return Object.values(grouped)
    .map(item => ({
      date: item.date,
      value: item.value,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const processGeographicData = (
  rawData: any[],
  countryKey: string,
  valueKey: string
): GeographicDataPoint[] => {
  const grouped = rawData.reduce((acc, item) => {
    const country = item[countryKey];
    if (!country) return acc;

    if (!acc[country]) {
      acc[country] = {
        country,
        countryCode: item.countryCode || country.slice(0, 2).toUpperCase(),
        value: 0,
        latitude: item.latitude,
        longitude: item.longitude,
      };
    }

    acc[country].value += Number(item[valueKey]) || 0;
    return acc;
  }, {} as Record<string, GeographicDataPoint>);

  const processed = Object.values(grouped);
  const total = processed.reduce((sum, item) => sum + item.value, 0);

  return processed
    .map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
};

// Performance optimization utilities
export const createDebouncedHandler = <T extends any[]>(
  handler: (...args: T) => void,
  delay: number = 300
) => {
  return debounce(handler, delay);
};

export const createThrottledHandler = <T extends any[]>(
  handler: (...args: T) => void,
  limit: number = 100
) => {
  return throttle(handler, limit);
};

// Virtualization utilities
export const shouldVirtualize = (itemCount: number, threshold: number = 100): boolean => {
  return itemCount > threshold;
};

export const getVirtualizationConfig = (
  itemCount: number,
  itemHeight: number = 60
): VirtualizationOptions => {
  return {
    itemSize: itemHeight,
    overscanCount: Math.min(10, Math.ceil(itemCount * 0.1)),
    threshold: 100,
  };
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    dataProcessingTime: 0,
    chartInitializationTime: 0,
    totalMemoryUsage: 0,
    frameRate: 0,
  };

  private startTimes: Map<string, number> = new Map();

  startTimer(operation: keyof PerformanceMetrics): void {
    this.startTimes.set(operation, performance.now());
  }

  endTimer(operation: keyof PerformanceMetrics): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.metrics[operation] = duration;
    this.startTimes.delete(operation);

    return duration;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  logMetrics(): void {
    console.group('📊 Analytics Performance Metrics');
    Object.entries(this.metrics).forEach(([key, value]) => {
      console.log(`${key}: ${value.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

// Data validation utilities
export const validateChartData = (data: ChartDataPoint[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every(item =>
    typeof item.label === 'string' &&
    typeof item.value === 'number' &&
    !isNaN(item.value) &&
    item.value >= 0
  );
};

export const validateTimeSeriesData = (data: TimeSeriesDataPoint[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false;

  return data.every(item =>
    (item.date instanceof Date || typeof item.date === 'string') &&
    typeof item.value === 'number' &&
    !isNaN(item.value)
  );
};

// Memory management utilities
export const cleanupChartRefs = (refs: React.RefObject<any>[]): void => {
  refs.forEach(ref => {
    if (ref.current?.chartInstance) {
      ref.current.chartInstance.destroy();
    }
  });
};

// Export utilities
export const prepareDataForExport = (
  data: ChartDataPoint[] | TimeSeriesDataPoint[] | GeographicDataPoint[],
  format: 'csv' | 'json'
): string => {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // CSV format
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = (row as any)[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
};

// Color utilities for dynamic theming
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateColorVariations = (baseColor: string, count: number): string[] => {
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const alpha = 0.3 + (0.7 * i) / (count - 1);
    variations.push(hexToRgba(baseColor, alpha));
  }

  return variations;
};

// Real-time data utilities
export const createDataUpdateHandler = (
  updateCallback: (data: any) => void,
  batchSize: number = 10,
  batchDelay: number = 1000
) => {
  let batch: any[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const processBatch = () => {
    if (batch.length > 0) {
      updateCallback(batch);
      batch = [];
    }
    timeoutId = null;
  };

  return (data: any) => {
    batch.push(data);

    if (batch.length >= batchSize) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      processBatch();
    } else if (!timeoutId) {
      timeoutId = setTimeout(processBatch, batchDelay);
    }
  };
};