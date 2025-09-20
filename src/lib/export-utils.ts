/**
 * Enhanced analytics export utilities with streaming, caching, and security
 */

import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';
import crypto from 'crypto';
import { Readable, Transform } from 'stream';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { query } from './database';
import {
  ExportableAnalyticsData,
  ExportFormat,
  ExportGranularity,
  DataFilter,
  ExportMetadata,
  ExportPerformanceMetrics,
  ExportValidationResult,
  StreamingExportContext
} from '@/types/export';

// Rate limiter configuration
const exportRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: any) => req.userId || req.ip,
  points: 5, // 5 exports
  duration: 3600, // per hour
});

const heavyExportRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: any) => req.userId || req.ip,
  points: 2, // 2 heavy exports (raw data)
  duration: 3600, // per hour
});

// Cache for recent exports
const exportCache = new Map<string, {
  data: any;
  metadata: ExportMetadata;
  expiresAt: Date;
}>();

/**
 * Validate export request parameters
 */
export function validateExportRequest(
  pollId: string,
  format: ExportFormat,
  granularity: ExportGranularity,
  filters: DataFilter,
  userId?: string
): ExportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let estimatedRows = 0;
  let estimatedSize = 0;

  // Validate poll ID
  if (!pollId || !/^[a-zA-Z0-9-_]{1,50}$/.test(pollId)) {
    errors.push('Invalid poll ID format');
  }

  // Validate format
  if (!['csv', 'json', 'xlsx'].includes(format)) {
    errors.push('Invalid export format. Must be csv, json, or xlsx');
  }

  // Validate granularity
  if (!['summary', 'detailed', 'raw'].includes(granularity)) {
    errors.push('Invalid granularity. Must be summary, detailed, or raw');
  }

  // Validate date range
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('Invalid date format. Use YYYY-MM-DD');
    } else if (start > end) {
      errors.push('Start date must be before end date');
    } else if (end > new Date()) {
      warnings.push('End date is in the future');
    }

    // Estimate data size based on date range
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      warnings.push('Large date range may result in slow processing');
      estimatedRows += daysDiff * 100; // Rough estimate
    } else {
      estimatedRows += daysDiff * 50;
    }
  } else {
    estimatedRows = 1000; // Default estimate
  }

  // Validate max rows
  if (filters.maxRows) {
    if (filters.maxRows < 1 || filters.maxRows > 100000) {
      errors.push('Max rows must be between 1 and 100,000');
    }
    estimatedRows = Math.min(estimatedRows, filters.maxRows);
  }

  // Estimate file size
  const rowSizeBytes = granularity === 'raw' ? 500 : granularity === 'detailed' ? 200 : 100;
  estimatedSize = estimatedRows * rowSizeBytes;

  // Check for potentially large exports
  if (estimatedSize > 50 * 1024 * 1024) { // 50MB
    warnings.push('Large export detected. Consider using date filters to reduce size.');
  }

  // Raw data access validation
  if (granularity === 'raw' && !userId) {
    errors.push('Raw data export requires authentication');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    estimatedSize,
    estimatedRows,
    processingTime: Math.max(1, Math.ceil(estimatedRows / 1000)) // seconds
  };
}

/**
 * Check rate limits for export requests
 */
export async function checkRateLimit(
  userId: string | undefined,
  ip: string,
  granularity: ExportGranularity
): Promise<{ allowed: boolean; msBeforeNext?: number }> {
  const identifier = userId || ip;

  try {
    const limiter = granularity === 'raw' ? heavyExportRateLimiter : exportRateLimiter;
    await limiter.consume(identifier);
    return { allowed: true };
  } catch (rejRes: any) {
    return {
      allowed: false,
      msBeforeNext: rejRes.msBeforeNext
    };
  }
}

/**
 * Generate cache key for export requests
 */
function generateCacheKey(
  pollId: string,
  format: ExportFormat,
  granularity: ExportGranularity,
  filters: DataFilter
): string {
  const filterString = JSON.stringify(filters, Object.keys(filters).sort());
  return crypto
    .createHash('md5')
    .update(`${pollId}-${format}-${granularity}-${filterString}`)
    .digest('hex');
}

/**
 * Check if cached export exists and is valid
 */
export function getCachedExport(
  pollId: string,
  format: ExportFormat,
  granularity: ExportGranularity,
  filters: DataFilter
): { data: any; metadata: ExportMetadata } | null {
  // No caching for raw data exports
  if (granularity === 'raw') return null;

  const cacheKey = generateCacheKey(pollId, format, granularity, filters);
  const cached = exportCache.get(cacheKey);

  if (cached && cached.expiresAt > new Date()) {
    return { data: cached.data, metadata: cached.metadata };
  }

  if (cached) {
    exportCache.delete(cacheKey);
  }

  return null;
}

/**
 * Cache export result
 */
export function cacheExport(
  pollId: string,
  format: ExportFormat,
  granularity: ExportGranularity,
  filters: DataFilter,
  data: any,
  metadata: ExportMetadata,
  ttlMinutes: number = 30
): void {
  if (granularity === 'raw') return; // Don't cache raw data

  const cacheKey = generateCacheKey(pollId, format, granularity, filters);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  exportCache.set(cacheKey, { data, metadata, expiresAt });

  // Clean up expired entries
  for (const [key, value] of exportCache.entries()) {
    if (value.expiresAt <= new Date()) {
      exportCache.delete(key);
    }
  }
}

/**
 * Fetch comprehensive analytics data from database
 */
export async function fetchAnalyticsData(
  pollId: string,
  granularity: ExportGranularity,
  filters: DataFilter
): Promise<ExportableAnalyticsData> {
  const startTime = Date.now();
  let whereClause = 'WHERE poll_id = $1';
  let params: any[] = [pollId];
  let paramIndex = 2;

  // Build dynamic filters
  if (filters.startDate) {
    whereClause += ` AND created_at >= $${paramIndex}`;
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    whereClause += ` AND created_at <= $${paramIndex}`;
    params.push(filters.endDate + ' 23:59:59');
    paramIndex++;
  }

  if (filters.country) {
    whereClause += ` AND country_code = $${paramIndex}`;
    params.push(filters.country.toUpperCase());
    paramIndex++;
  }

  if (filters.deviceType) {
    whereClause += ` AND device_type = $${paramIndex}`;
    params.push(filters.deviceType);
    paramIndex++;
  }

  // Base poll information
  const pollResult = await query(`
    SELECT
      p.id,
      p.question,
      p.options,
      p.created_at,
      p.creator_id,
      p.is_multiple_choice,
      p.hide_results
    FROM polls p
    WHERE p.id = $1
  `, [pollId]);

  if (pollResult.rows.length === 0) {
    throw new Error('Poll not found');
  }

  const poll = pollResult.rows[0];

  // Summary metrics
  const summaryResult = await query(`
    SELECT * FROM poll_analytics_summary
    WHERE poll_id = $1
  `, [pollId]);

  const summary = summaryResult.rows[0] || {};

  const data: ExportableAnalyticsData = {
    poll_info: {
      id: poll.id,
      question: poll.question,
      options: poll.options,
      created_at: poll.created_at,
      creator_id: poll.creator_id,
      is_multiple_choice: poll.is_multiple_choice,
      hide_results: poll.hide_results,
      export_date: new Date().toISOString()
    },
    summary_metrics: {
      total_views: summary.total_views || 0,
      unique_viewers: summary.unique_viewers || 0,
      total_votes: summary.total_votes || 0,
      total_shares: summary.total_shares || 0,
      completion_rate: summary.completion_rate || 0,
      bounce_rate: summary.bounce_rate || 0,
      avg_time_on_page: summary.avg_time_on_page || 0,
      avg_time_to_vote: summary.avg_time_to_vote || 0,
      viral_coefficient: summary.viral_coefficient || 0,
      share_to_vote_ratio: summary.share_to_vote_ratio || 0,
      return_visitor_rate: summary.return_visitor_rate || 0,
      interaction_rate: summary.interaction_rate || 0
    },
    geographic_data: {
      top_countries: [],
      regional_breakdown: []
    },
    device_analytics: {
      device_breakdown: summary.device_breakdown || {},
      browser_breakdown: summary.browser_breakdown || {},
      os_breakdown: summary.os_breakdown || {},
      device_performance: []
    },
    temporal_data: {
      hourly_breakdown: [],
      daily_breakdown: [],
      peak_hours: []
    },
    sharing_analytics: {
      platform_breakdown: summary.share_breakdown || {},
      viral_metrics: {
        reach_multiplier: summary.viral_coefficient || 0,
        social_amplification: (summary.total_shares || 0) / Math.max(summary.total_votes || 1, 1),
        engagement_virality: (summary.total_shares || 0) / Math.max(summary.total_views || 1, 1),
        viral_loop_efficiency: 0
      },
      referral_sources: []
    },
    engagement_metrics: {
      scroll_depth_analysis: [],
      interaction_patterns: [],
      session_quality: {
        avg_session_duration: summary.avg_time_on_page || 0,
        pages_per_session: 1,
        return_visits: 0
      }
    }
  };

  // Fetch detailed data based on granularity
  if (granularity === 'detailed' || granularity === 'raw') {
    // Geographic data
    const geoResult = await query(`
      SELECT
        country_code,
        COUNT(*) as views,
        COUNT(DISTINCT visitor_hash) as unique_visitors
      FROM page_view_events
      ${whereClause}
        AND country_code IS NOT NULL
      GROUP BY country_code
      ORDER BY views DESC
      LIMIT 20
    `, params);

    data.geographic_data.top_countries = geoResult.rows.map(row => ({
      country_code: row.country_code,
      country_name: getCountryName(row.country_code),
      views: parseInt(row.views),
      votes: 0, // Would need join to get votes by country
      shares: 0, // Would need join to get shares by country
      percentage: 0 // Calculate after getting totals
    }));

    // Temporal data
    if (filters.startDate && filters.endDate) {
      const dailyResult = await query(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as views,
          COUNT(DISTINCT visitor_hash) as unique_visitors
        FROM page_view_events
        ${whereClause}
        GROUP BY DATE(created_at)
        ORDER BY date
      `, params);

      data.temporal_data.daily_breakdown = dailyResult.rows.map(row => ({
        date: row.date,
        views: parseInt(row.views),
        votes: 0,
        shares: 0,
        unique_visitors: parseInt(row.unique_visitors)
      }));
    }

    // Device performance analysis
    const devicePerfResult = await query(`
      SELECT
        device_type,
        AVG(time_on_page) as avg_load_time,
        COUNT(CASE WHEN time_on_page < 5 THEN 1 END)::float / COUNT(*)::float as bounce_rate
      FROM page_view_events
      ${whereClause}
        AND device_type IS NOT NULL
        AND time_on_page IS NOT NULL
      GROUP BY device_type
    `, params);

    data.device_analytics.device_performance = devicePerfResult.rows.map(row => ({
      device_type: row.device_type,
      avg_load_time: parseFloat(row.avg_load_time) || 0,
      bounce_rate: parseFloat(row.bounce_rate) || 0,
      completion_rate: 0 // Would need additional calculation
    }));
  }

  // Raw events data (only for raw granularity)
  if (granularity === 'raw') {
    const limitClause = filters.maxRows ? `LIMIT ${filters.maxRows}` : 'LIMIT 10000';

    // Page views
    const pageViewsResult = await query(`
      SELECT * FROM page_view_events
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `, params);

    // Vote events
    const votesResult = await query(`
      SELECT * FROM vote_events
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `, params);

    // Share events
    const sharesResult = await query(`
      SELECT * FROM share_events
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `, params);

    data.raw_events = {
      page_views: pageViewsResult.rows,
      votes: votesResult.rows,
      shares: sharesResult.rows,
      clicks: [] // Would need click events table
    };
  }

  return data;
}

/**
 * Generate CSV export with proper formatting
 */
export function generateCSV(data: ExportableAnalyticsData, granularity: ExportGranularity): string {
  const rows: string[] = [];

  // Header and metadata
  rows.push('Poll Analytics Export');
  rows.push(`Generated: ${data.poll_info.export_date}`);
  rows.push(`Poll ID: ${data.poll_info.id}`);
  rows.push(`Question: "${data.poll_info.question}"`);
  rows.push(`Created: ${data.poll_info.created_at}`);
  rows.push('');

  // Summary metrics
  rows.push('SUMMARY METRICS');
  rows.push('Metric,Value');
  Object.entries(data.summary_metrics).forEach(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    rows.push(`"${label}",${value}`);
  });
  rows.push('');

  // Geographic data
  if (data.geographic_data.top_countries.length > 0) {
    rows.push('TOP COUNTRIES');
    rows.push('Country Code,Country Name,Views,Votes,Shares');
    data.geographic_data.top_countries.forEach(country => {
      rows.push(`${country.country_code},"${country.country_name}",${country.views},${country.votes},${country.shares}`);
    });
    rows.push('');
  }

  // Device analytics
  if (Object.keys(data.device_analytics.device_breakdown).length > 0) {
    rows.push('DEVICE BREAKDOWN');
    rows.push('Device Type,Count');
    Object.entries(data.device_analytics.device_breakdown).forEach(([device, count]) => {
      rows.push(`"${device}",${count}`);
    });
    rows.push('');
  }

  // Temporal data
  if (data.temporal_data.daily_breakdown.length > 0) {
    rows.push('DAILY BREAKDOWN');
    rows.push('Date,Views,Votes,Shares,Unique Visitors');
    data.temporal_data.daily_breakdown.forEach(day => {
      rows.push(`${day.date},${day.views},${day.votes},${day.shares},${day.unique_visitors}`);
    });
    rows.push('');
  }

  // Raw events (only for raw granularity)
  if (granularity === 'raw' && data.raw_events) {
    if (data.raw_events.page_views.length > 0) {
      rows.push('PAGE VIEW EVENTS');
      const headers = Object.keys(data.raw_events.page_views[0]);
      rows.push(headers.map(h => `"${h}"`).join(','));
      data.raw_events.page_views.forEach(event => {
        const values = headers.map(h => {
          const value = event[h];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        rows.push(values.join(','));
      });
      rows.push('');
    }
  }

  return rows.join('\n');
}

/**
 * Generate Excel file
 */
export function generateXLSX(data: ExportableAnalyticsData, granularity: ExportGranularity): Buffer {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['Poll Analytics Summary'],
    ['Generated', data.poll_info.export_date],
    ['Poll ID', data.poll_info.id],
    ['Question', data.poll_info.question],
    ['Created', data.poll_info.created_at],
    [],
    ['Metric', 'Value'],
    ...Object.entries(data.summary_metrics).map(([key, value]) => [
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    ])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Geographic sheet
  if (data.geographic_data.top_countries.length > 0) {
    const geoData = [
      ['Country Code', 'Country Name', 'Views', 'Votes', 'Shares'],
      ...data.geographic_data.top_countries.map(country => [
        country.country_code,
        country.country_name,
        country.views,
        country.votes,
        country.shares
      ])
    ];
    const geoSheet = XLSX.utils.aoa_to_sheet(geoData);
    XLSX.utils.book_append_sheet(workbook, geoSheet, 'Geographic');
  }

  // Device analytics sheet
  if (Object.keys(data.device_analytics.device_breakdown).length > 0) {
    const deviceData = [
      ['Device Type', 'Count'],
      ...Object.entries(data.device_analytics.device_breakdown).map(([device, count]) => [device, count])
    ];
    const deviceSheet = XLSX.utils.aoa_to_sheet(deviceData);
    XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Devices');
  }

  // Raw events sheets (only for raw granularity)
  if (granularity === 'raw' && data.raw_events) {
    if (data.raw_events.page_views.length > 0) {
      const pageViewSheet = XLSX.utils.json_to_sheet(data.raw_events.page_views);
      XLSX.utils.book_append_sheet(workbook, pageViewSheet, 'Page Views');
    }

    if (data.raw_events.votes.length > 0) {
      const voteSheet = XLSX.utils.json_to_sheet(data.raw_events.votes);
      XLSX.utils.book_append_sheet(workbook, voteSheet, 'Votes');
    }

    if (data.raw_events.shares.length > 0) {
      const shareSheet = XLSX.utils.json_to_sheet(data.raw_events.shares);
      XLSX.utils.book_append_sheet(workbook, shareSheet, 'Shares');
    }
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/**
 * Generate data integrity checksum
 */
export function generateChecksum(data: any): string {
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('md5').update(dataString).digest('hex');
}

/**
 * Create export metadata
 */
export function createExportMetadata(
  data: ExportableAnalyticsData,
  format: ExportFormat,
  granularity: ExportGranularity,
  filters: DataFilter,
  recordCount: number
): ExportMetadata {
  return {
    pollId: data.poll_info.id,
    pollQuestion: data.poll_info.question,
    pollCreatedAt: data.poll_info.created_at,
    exportedAt: data.poll_info.export_date,
    exportFormat: format,
    granularity,
    filters,
    recordCount,
    dataIntegrity: {
      checksumMD5: generateChecksum(data),
      version: '1.0'
    }
  };
}

/**
 * Helper function to get country name from code
 */
function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    // Add more as needed
  };

  return countries[countryCode.toUpperCase()] || countryCode.toUpperCase();
}

/**
 * Calculate performance metrics for monitoring
 */
export function calculatePerformanceMetrics(
  startTime: number,
  queryTime: number,
  processingTime: number,
  rowsProcessed: number,
  memoryUsage: number
): ExportPerformanceMetrics {
  const totalTime = Date.now() - startTime;

  return {
    queryTime,
    processingTime,
    streamingTime: totalTime - queryTime - processingTime,
    totalTime,
    memoryUsage,
    rowsProcessed,
    compressionRatio: undefined // Would be calculated if compression is used
  };
}