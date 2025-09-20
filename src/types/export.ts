/**
 * Types for analytics export functionality
 */

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export type ExportGranularity = 'summary' | 'detailed' | 'raw';

export type DataFilter = {
  startDate?: string;
  endDate?: string;
  country?: string;
  deviceType?: string;
  browser?: string;
  platform?: string;
  includeDetails?: boolean;
  maxRows?: number;
};

export interface ExportRequest {
  pollId: string;
  format: ExportFormat;
  granularity: ExportGranularity;
  filters: DataFilter;
  columns?: string[];
  userId?: string;
}

export interface ExportResponse {
  success: boolean;
  data?: any;
  filename: string;
  size: number;
  recordCount: number;
  generatedAt: string;
  error?: string;
}

export interface ExportMetadata {
  pollId: string;
  pollQuestion: string;
  pollCreatedAt: string;
  exportedAt: string;
  exportFormat: ExportFormat;
  granularity: ExportGranularity;
  filters: DataFilter;
  recordCount: number;
  dataIntegrity: {
    checksumMD5: string;
    version: string;
  };
}

export interface StreamingExportContext {
  pollId: string;
  userId: string;
  format: ExportFormat;
  batchSize: number;
  currentOffset: number;
  totalRows: number;
  startTime: Date;
}

export interface ExportPerformanceMetrics {
  queryTime: number;
  processingTime: number;
  streamingTime: number;
  totalTime: number;
  memoryUsage: number;
  rowsProcessed: number;
  compressionRatio?: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

// Enhanced analytics data structure for export
export interface ExportableAnalyticsData {
  poll_info: {
    id: string;
    question: string;
    options: string[];
    created_at: string;
    creator_id?: string;
    is_multiple_choice: boolean;
    hide_results: boolean;
    export_date: string;
  };

  summary_metrics: {
    total_views: number;
    unique_viewers: number;
    total_votes: number;
    total_shares: number;
    completion_rate: number;
    bounce_rate: number;
    avg_time_on_page: number;
    avg_time_to_vote: number;
    viral_coefficient: number;
    share_to_vote_ratio: number;
    return_visitor_rate: number;
    interaction_rate: number;
  };

  geographic_data: {
    top_countries: Array<{
      country_code: string;
      country_name: string;
      views: number;
      votes: number;
      shares: number;
      percentage: number;
    }>;
    regional_breakdown: Array<{
      region_code: string;
      region_name: string;
      views: number;
      votes: number;
      percentage: number;
    }>;
  };

  device_analytics: {
    device_breakdown: Record<string, number>;
    browser_breakdown: Record<string, number>;
    os_breakdown: Record<string, number>;
    device_performance: Array<{
      device_type: string;
      avg_load_time: number;
      bounce_rate: number;
      completion_rate: number;
    }>;
  };

  temporal_data: {
    hourly_breakdown: Array<{
      hour: number;
      views: number;
      votes: number;
      shares: number;
    }>;
    daily_breakdown: Array<{
      date: string;
      views: number;
      votes: number;
      shares: number;
      unique_visitors: number;
    }>;
    peak_hours: Array<{
      hour: number;
      activity_score: number;
    }>;
  };

  sharing_analytics: {
    platform_breakdown: Record<string, number>;
    viral_metrics: {
      reach_multiplier: number;
      social_amplification: number;
      engagement_virality: number;
      viral_loop_efficiency: number;
    };
    referral_sources: Array<{
      source: string;
      clicks: number;
      conversions: number;
      conversion_rate: number;
    }>;
  };

  engagement_metrics: {
    scroll_depth_analysis: Array<{
      depth_percentage: number;
      user_count: number;
    }>;
    interaction_patterns: Array<{
      pattern_type: string;
      frequency: number;
      conversion_rate: number;
    }>;
    session_quality: {
      avg_session_duration: number;
      pages_per_session: number;
      return_visits: number;
    };
  };

  raw_events?: {
    page_views: Array<any>;
    votes: Array<any>;
    shares: Array<any>;
    clicks: Array<any>;
  };
}

export interface ExportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedSize: number;
  estimatedRows: number;
  processingTime: number;
}