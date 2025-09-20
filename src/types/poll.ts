export interface Poll {
  id: string
  question: string
  description?: string
  options: string[]
  poll_type?: 'text' | 'image'
  image_options?: PollImageOption[]
  allow_multiple_selections?: boolean
  max_selections?: number
  comments_enabled?: boolean
  hide_results?: 'none' | 'until_vote' | 'entirely'
  user_id?: string | null
  is_public?: boolean
  allow_anonymous_voting?: boolean
  created_at: string
  updated_at: string
}

export interface PollImageOption {
  id: string
  image_url: string
  caption?: string
  order_index: number
}

export interface Vote {
  id: string
  poll_id: string
  option_index: number
  voter_ip: string
  voted_at: string
}

export interface PollResults {
  poll: Poll
  results: {
    option: string
    votes: number
    percentage: number
  }[]
  totalVotes: number
}

export interface CreatePollData {
  question: string
  description?: string
  options: string[]
  pollType?: 'text' | 'image'
  imageOptions?: CreateImageOption[]
  allowMultipleSelections?: boolean
  maxSelections?: number
  commentsEnabled?: boolean
  hideResults?: 'none' | 'until_vote' | 'entirely'
}

export interface CreateImageOption {
  imageUrl: string
  caption?: string
}

export interface VoteData {
  optionIndex: number | number[]
}

export interface Comment {
  id: string
  poll_id: string
  user_id: string
  user_name: string
  user_image?: string
  content: string
  parent_id?: string
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface CreateCommentData {
  content: string
  parent_id?: string
}

// ============================================================================
// COMPREHENSIVE ANALYTICS TYPE DEFINITIONS
// ============================================================================

/**
 * Comprehensive poll analytics interface with immutable structure
 * All timestamps are ISO 8601 strings for JSON serialization compatibility
 */
export interface PollAnalytics {
  readonly poll_id: string
  readonly question: string
  readonly poll_created_at: string
  readonly analytics_updated_at: string

  // Core metrics
  readonly core_metrics: CoreMetrics

  // Vote-specific analytics
  readonly vote_metrics: VoteMetrics

  // Engagement tracking
  readonly engagement: EngagementTracking

  // Geographic and device breakdown
  readonly demographics: DemographicBreakdown

  // Social sharing metrics
  readonly sharing: SharingMetrics

  // Time-based analytics
  readonly temporal: TemporalAnalytics

  // Performance metrics
  readonly performance: PerformanceMetrics

  // Advanced analytics (optional)
  readonly advanced?: AdvancedAnalytics
}

/**
 * Core poll metrics - fundamental engagement numbers
 */
export interface CoreMetrics {
  readonly total_views: number
  readonly unique_viewers: number
  readonly total_votes: number
  readonly total_shares: number
  readonly total_comments?: number
  readonly view_to_vote_conversion: number
  readonly completion_rate: number
  readonly bounce_rate: number
  readonly return_visitor_rate: number
}

/**
 * Vote-specific metrics and patterns
 */
export interface VoteMetrics {
  readonly votes_by_option: readonly VoteOptionMetrics[]
  readonly voting_patterns: VotingPatterns
  readonly vote_timing: VoteTimingMetrics
  readonly vote_quality: VoteQualityMetrics
}

export interface VoteOptionMetrics {
  readonly option_index: number
  readonly option_text: string
  readonly vote_count: number
  readonly percentage: number
  readonly unique_voters: number
  readonly vote_velocity: number // votes per hour
  readonly first_vote_at?: string | null
  readonly last_vote_at?: string | null
}

export interface VotingPatterns {
  readonly peak_voting_hour: number
  readonly avg_time_to_vote: number // seconds
  readonly vote_distribution_skew: number
  readonly multi_selection_usage?: number | null // for multi-select polls
  readonly option_correlation?: readonly OptionCorrelation[] | null
}

export interface OptionCorrelation {
  readonly option_a: number
  readonly option_b: number
  readonly correlation_coefficient: number
  readonly joint_selection_count: number
}

export interface VoteTimingMetrics {
  readonly median_time_to_vote: number
  readonly fastest_vote_time: number
  readonly slowest_vote_time: number
  readonly vote_abandonment_rate: number
  readonly time_buckets: readonly TimeBucket[]
}

export interface TimeBucket {
  readonly range_start: number // seconds
  readonly range_end: number // seconds
  readonly vote_count: number
  readonly percentage: number
}

export interface VoteQualityMetrics {
  readonly suspected_spam_votes: number
  readonly verified_human_votes: number
  readonly duplicate_attempt_rate: number
  readonly vote_confidence_score: number // 0-1
}

/**
 * Comprehensive engagement tracking
 */
export interface EngagementTracking {
  readonly session_metrics: SessionMetrics
  readonly interaction_metrics: InteractionMetrics
  readonly retention_metrics: RetentionMetrics
  readonly viral_metrics: ViralMetrics
}

export interface SessionMetrics {
  readonly avg_session_duration: number // seconds
  readonly median_session_duration: number
  readonly total_sessions: number
  readonly pages_per_session: number
  readonly session_quality_score: number
}

export interface InteractionMetrics {
  readonly clicks_on_options: number
  readonly hover_time_per_option: readonly number[]
  readonly scroll_depth_avg: number // percentage
  readonly qr_code_scans: number
  readonly social_share_clicks: number
  readonly copy_link_clicks: number
}

export interface RetentionMetrics {
  readonly return_visits_1d: number
  readonly return_visits_7d: number
  readonly return_visits_30d: number
  readonly user_retention_rate: number
  readonly poll_bookmark_rate: number
}

export interface ViralMetrics {
  readonly viral_coefficient: number
  readonly k_factor: number // viral growth factor
  readonly share_to_vote_ratio: number
  readonly referral_conversion_rate: number
  readonly organic_discovery_rate: number
}

/**
 * Geographic and device analytics
 */
export interface DemographicBreakdown {
  readonly geographic: GeographicBreakdown
  readonly device: DeviceMetrics
  readonly temporal_distribution: TemporalDistribution
}

export interface GeographicBreakdown {
  readonly countries: readonly CountryMetrics[]
  readonly regions: readonly RegionMetrics[]
  readonly cities: readonly CityMetrics[]
  readonly timezone_distribution: readonly TimezoneMetrics[]
}

export interface CountryMetrics {
  readonly country_code: string
  readonly country_name: string
  readonly views: number
  readonly votes: number
  readonly shares: number
  readonly completion_rate: number
  readonly avg_session_duration: number
}

export interface RegionMetrics {
  readonly region_code: string
  readonly region_name: string
  readonly country_code: string
  readonly views: number
  readonly votes: number
  readonly completion_rate: number
}

export interface CityMetrics {
  readonly city_name: string
  readonly region_code: string
  readonly country_code: string
  readonly views: number
  readonly votes: number
  readonly completion_rate: number
}

export interface TimezoneMetrics {
  readonly timezone: string
  readonly views: number
  readonly votes: number
  readonly peak_activity_hour: number
}

/**
 * Comprehensive device and browser metrics
 */
export interface DeviceMetrics {
  readonly device_types: readonly DeviceTypeMetrics[]
  readonly browsers: readonly BrowserMetrics[]
  readonly operating_systems: readonly OSMetrics[]
  readonly screen_resolutions: readonly ScreenMetrics[]
  readonly connection_types: readonly ConnectionMetrics[]
}

export interface DeviceTypeMetrics {
  readonly device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  readonly views: number
  readonly votes: number
  readonly shares: number
  readonly completion_rate: number
  readonly avg_session_duration: number
  readonly bounce_rate: number
}

export interface BrowserMetrics {
  readonly browser_name: string
  readonly browser_version?: string | null
  readonly views: number
  readonly votes: number
  readonly completion_rate: number
  readonly performance_score: number // 0-1
}

export interface OSMetrics {
  readonly os_name: string
  readonly os_version?: string | null
  readonly views: number
  readonly votes: number
  readonly completion_rate: number
}

export interface ScreenMetrics {
  readonly width: number
  readonly height: number
  readonly views: number
  readonly completion_rate: number
}

export interface ConnectionMetrics {
  readonly connection_type: 'wifi' | '4g' | '3g' | '2g' | 'unknown'
  readonly views: number
  readonly avg_load_time: number
  readonly completion_rate: number
}

export interface TemporalDistribution {
  readonly hourly_distribution: readonly number[] // 24 hours
  readonly daily_distribution: readonly number[] // 7 days
  readonly monthly_patterns: readonly MonthlyPattern[]
}

export interface MonthlyPattern {
  readonly month: number // 1-12
  readonly year: number
  readonly views: number
  readonly votes: number
  readonly shares: number
}

/**
 * Social sharing and referral metrics
 */
export interface SharingMetrics {
  readonly share_channels: readonly ShareChannelMetrics[]
  readonly referral_sources: readonly ReferralMetrics[]
  readonly social_engagement: SocialEngagementMetrics
  readonly viral_tracking: ViralTrackingMetrics
}

export interface ShareChannelMetrics {
  readonly channel: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'whatsapp' | 'telegram' | 'copy_link' | 'qr_code' | 'other'
  readonly shares: number
  readonly clicks_from_shares: number
  readonly votes_from_shares: number
  readonly conversion_rate: number
}

export interface ReferralMetrics {
  readonly source_domain: string
  readonly referral_type: 'social' | 'search' | 'direct' | 'email' | 'other'
  readonly visits: number
  readonly votes: number
  readonly conversion_rate: number
}

export interface SocialEngagementMetrics {
  readonly social_mentions: number
  readonly social_reach: number
  readonly social_impressions: number
  readonly engagement_rate: number
}

export interface ViralTrackingMetrics {
  readonly generation_tracking: readonly GenerationMetrics[]
  readonly share_depth: number // max levels of sharing
  readonly viral_peak_time?: string | null
}

export interface GenerationMetrics {
  readonly generation: number // 0 = original, 1 = first share, etc.
  readonly participants: number
  readonly shares: number
  readonly votes: number
}

/**
 * Time-series and temporal analytics
 */
export interface TemporalAnalytics {
  readonly daily_metrics: readonly DailyMetrics[]
  readonly hourly_metrics: readonly HourlyMetrics[]
  readonly time_series: readonly TimeSeriesDataPoint[]
  readonly trend_analysis: TrendAnalysis
}

export interface DailyMetrics {
  readonly date: string // YYYY-MM-DD
  readonly views: number
  readonly unique_views: number
  readonly votes: number
  readonly shares: number
  readonly comments: number
  readonly completion_rate: number
  readonly avg_session_duration: number
  readonly bounce_rate: number
}

export interface HourlyMetrics {
  readonly hour: number // 0-23
  readonly date: string // YYYY-MM-DD
  readonly views: number
  readonly votes: number
  readonly shares: number
  readonly active_users: number
}

export interface TimeSeriesDataPoint {
  readonly timestamp: string // ISO 8601
  readonly views: number
  readonly votes: number
  readonly shares: number
  readonly active_users: number
  readonly cumulative_votes: number
}

export interface TrendAnalysis {
  readonly growth_rate_7d: number // percentage
  readonly growth_rate_30d: number
  readonly trending_score: number // 0-1
  readonly peak_engagement_time?: string | null
  readonly seasonal_patterns?: readonly SeasonalPattern[] | null
}

export interface SeasonalPattern {
  readonly pattern_type: 'daily' | 'weekly' | 'monthly'
  readonly pattern_strength: number // 0-1
  readonly peak_periods: readonly string[]
}

/**
 * Performance and technical metrics
 */
export interface PerformanceMetrics {
  readonly load_performance: LoadPerformanceMetrics
  readonly user_experience: UserExperienceMetrics
  readonly technical_health: TechnicalHealthMetrics
}

export interface LoadPerformanceMetrics {
  readonly avg_page_load_time: number // milliseconds
  readonly median_page_load_time: number
  readonly p95_page_load_time: number
  readonly first_contentful_paint: number
  readonly largest_contentful_paint: number
  readonly cumulative_layout_shift: number
  readonly first_input_delay: number
}

export interface UserExperienceMetrics {
  readonly user_satisfaction_score: number // 0-1
  readonly task_completion_rate: number
  readonly error_rate: number
  readonly accessibility_score: number // 0-1
  readonly mobile_usability_score: number // 0-1
}

export interface TechnicalHealthMetrics {
  readonly api_response_times: readonly number[]
  readonly error_counts: Record<string, number>
  readonly uptime_percentage: number
  readonly cache_hit_rate: number
}

/**
 * Advanced analytics (optional, for premium features)
 */
export interface AdvancedAnalytics {
  readonly cohort_analysis?: CohortAnalysis | null
  readonly funnel_analysis?: FunnelAnalysis | null
  readonly attribution_analysis?: AttributionAnalysis | null
  readonly predictive_metrics?: PredictiveMetrics | null
}

export interface CohortAnalysis {
  readonly cohorts: readonly CohortMetrics[]
  readonly retention_matrix: readonly number[][]
}

export interface CohortMetrics {
  readonly cohort_id: string
  readonly cohort_size: number
  readonly creation_date: string
  readonly retention_rates: readonly number[] // by week/month
}

export interface FunnelAnalysis {
  readonly funnel_steps: readonly FunnelStep[]
  readonly overall_conversion_rate: number
  readonly drop_off_points: readonly string[]
}

export interface FunnelStep {
  readonly step_name: string
  readonly step_order: number
  readonly users_entered: number
  readonly users_completed: number
  readonly conversion_rate: number
  readonly avg_time_in_step: number
}

export interface AttributionAnalysis {
  readonly attribution_model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay'
  readonly channel_attribution: readonly ChannelAttribution[]
  readonly cross_channel_impact: readonly CrossChannelImpact[]
}

export interface ChannelAttribution {
  readonly channel: string
  readonly attributed_votes: number
  readonly attribution_percentage: number
  readonly cost_per_vote?: number | null
}

export interface CrossChannelImpact {
  readonly primary_channel: string
  readonly supporting_channel: string
  readonly lift_percentage: number
}

export interface PredictiveMetrics {
  readonly predicted_total_votes: number
  readonly confidence_interval: readonly [number, number]
  readonly peak_voting_prediction?: string | null // timestamp
  readonly trend_prediction: 'growing' | 'declining' | 'stable'
}

/**
 * Export configuration for analytics data
 * Supports multiple formats and flexible date range selection
 */
export interface ExportConfiguration {
  readonly format: 'csv' | 'json' | 'xlsx' | 'pdf'
  readonly date_range: DateRange
  readonly data_granularity: 'hourly' | 'daily' | 'weekly' | 'monthly'
  readonly include_demographics: boolean
  readonly include_time_series: boolean
  readonly include_advanced_metrics: boolean
  readonly compression?: 'none' | 'gzip' | 'zip' | null
  readonly custom_fields?: readonly string[] | null
}

export interface DateRange {
  readonly start_date: string // YYYY-MM-DD
  readonly end_date: string // YYYY-MM-DD
  readonly timezone?: string | null // IANA timezone
}

/**
 * Real-time analytics update interface
 * Used for live dashboard updates and streaming analytics
 */
export interface AnalyticsUpdate {
  readonly poll_id: string
  readonly update_type: 'incremental' | 'snapshot'
  readonly timestamp: string
  readonly metrics: Partial<PollAnalytics>
  readonly affected_fields: readonly string[]
}

/**
 * Analytics aggregation interface
 * For dashboard summaries and multi-poll analytics
 */
export interface AggregatedAnalytics {
  readonly user_id?: string | null
  readonly aggregation_period: DateRange
  readonly poll_count: number
  readonly total_metrics: CoreMetrics
  readonly top_performing_polls: readonly TopPollMetrics[]
  readonly performance_trends: TrendAnalysis
  readonly comparative_metrics: ComparativeMetrics
}

export interface TopPollMetrics {
  readonly poll_id: string
  readonly question: string
  readonly metric_type: 'views' | 'votes' | 'shares' | 'engagement'
  readonly metric_value: number
  readonly rank: number
}

export interface ComparativeMetrics {
  readonly avg_completion_rate: number
  readonly avg_viral_coefficient: number
  readonly best_performing_category?: string | null
  readonly performance_percentile: number // user's performance vs all users
}

// Legacy interface for backward compatibility - deprecated, use PollAnalytics instead
/** @deprecated Use PollAnalytics instead for comprehensive analytics */
export interface AnalyticsData {
  poll_id: string
  question: string
  poll_created_at: string
  total_views: number
  unique_viewers: number
  total_votes: number
  completion_rate: number
  total_shares: number
  share_to_vote_ratio: number
  avg_time_to_vote: number
  avg_time_on_page: number
  top_countries: string[]
  device_breakdown: Record<string, number>
  browser_breakdown: Record<string, number>
  os_breakdown: Record<string, number>
  share_breakdown: Record<string, number>
  viral_coefficient: number
  bounce_rate: number
  return_visitor_rate: number
  peak_hour: number
  analytics_updated_at: string
  daily_analytics?: DailyAnalytics[]
  geographic_data?: GeographicData[]
  time_series_data?: TimeSeriesData[]
}

/** @deprecated Use DailyMetrics instead */
export interface DailyAnalytics {
  date: string
  views: number
  votes: number
  shares: number
  completion_rate: number
}

/** @deprecated Use CountryMetrics instead */
export interface GeographicData {
  country_code: string
  country_name: string
  views: number
  votes: number
  completion_rate: number
}

/** @deprecated Use TimeSeriesDataPoint instead */
export interface TimeSeriesData {
  timestamp: string
  views: number
  votes: number
  active_users: number
}

/** @deprecated Use ExportConfiguration instead */
export interface ExportData {
  format: 'csv' | 'json' | 'xlsx'
  dateRange: {
    start: string
    end: string
  }
  includeDetails: boolean
}
