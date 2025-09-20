import { query } from './database';
import crypto from 'crypto';
import { headers } from 'next/headers';

/**
 * Analytics tracking system for poll.it
 * Provides privacy-conscious, GDPR-compliant analytics tracking
 */

// Types for analytics data
export interface AnalyticsEvent {
  pollId: string;
  eventType: 'page_view' | 'vote' | 'share' | 'click';
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface PageViewData {
  pollId: string;
  sessionId: string;
  timeOnPage?: number;
  scrollDepth?: number;
  referrer?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface VoteEventData {
  pollId: string;
  voteId: string;
  optionIndex: number;
  sessionId: string;
  timeToVote?: number;
  previousOptionsViewed?: number[];
  isFirstVoteInSession?: boolean;
}

export interface ShareEventData {
  pollId: string;
  sessionId: string;
  platform: string;
  shareMethod: 'button_click' | 'url_copy' | 'native_share';
  sharedUrl?: string;
}

export interface ClickEventData {
  pollId: string;
  sessionId: string;
  referrer?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  convertedToVote?: boolean;
  timeToConversion?: number;
}

/**
 * Privacy-conscious visitor identification
 * Creates a daily-unique hash to track unique visitors without storing personal data
 */
export function generateVisitorHash(ip: string, userAgent: string): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const data = `${ip}:${userAgent}:${today}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Extract device information from User-Agent header
 */
export function parseDeviceInfo(userAgent: string): {
  deviceType: string;
  browserFamily: string;
  osFamily: string;
} {
  const ua = userAgent.toLowerCase();

  // Device type detection
  let deviceType = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Browser detection
  let browserFamily = 'unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browserFamily = 'chrome';
  else if (ua.includes('firefox')) browserFamily = 'firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browserFamily = 'safari';
  else if (ua.includes('edg')) browserFamily = 'edge';
  else if (ua.includes('opera')) browserFamily = 'opera';

  // OS detection
  let osFamily = 'unknown';
  if (ua.includes('windows')) osFamily = 'windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) osFamily = 'macos';
  else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) osFamily = 'ios';
  else if (ua.includes('android')) osFamily = 'android';
  else if (ua.includes('linux')) osFamily = 'linux';

  return { deviceType, browserFamily, osFamily };
}

/**
 * Extract geographic information from request headers
 * Uses Vercel's geo headers for country/region detection
 */
export function extractGeoInfo(requestHeaders: Headers): {
  countryCode?: string;
  regionCode?: string;
} {
  // Vercel provides geo information in headers
  const countryCode = requestHeaders.get('x-vercel-ip-country') || undefined;
  const regionCode = requestHeaders.get('x-vercel-ip-country-region') || undefined;

  return {
    countryCode: countryCode?.toLowerCase(),
    regionCode: regionCode?.toLowerCase()
  };
}

/**
 * Track page view event
 */
export async function trackPageView(data: PageViewData, request: Request): Promise<void> {
  try {
    const requestHeaders = new Headers(request.headers);
    const ip = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || '127.0.0.1';
    const userAgent = requestHeaders.get('user-agent') || '';

    const visitorHash = generateVisitorHash(ip, userAgent);
    const deviceInfo = parseDeviceInfo(userAgent);
    const geoInfo = extractGeoInfo(requestHeaders);

    // Extract referrer domain (not full URL for privacy)
    const referrerDomain = data.referrer ? new URL(data.referrer).hostname : null;

    await query(`
      INSERT INTO page_view_events (
        poll_id, visitor_hash, session_id, device_type, browser_family, os_family,
        country_code, region_code, referrer_domain, utm_source, utm_medium, utm_campaign,
        time_on_page, scroll_depth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      data.pollId,
      visitorHash,
      data.sessionId,
      deviceInfo.deviceType,
      deviceInfo.browserFamily,
      deviceInfo.osFamily,
      geoInfo.countryCode,
      geoInfo.regionCode,
      referrerDomain,
      data.utmParams?.source,
      data.utmParams?.medium,
      data.utmParams?.campaign,
      data.timeOnPage,
      data.scrollDepth || 0
    ]);

    // Update unique viewers count
    await updateUniqueViewers(data.pollId);

  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't throw - analytics should never break the user experience
  }
}

/**
 * Track vote event
 */
export async function trackVoteEvent(data: VoteEventData, request: Request): Promise<void> {
  try {
    const requestHeaders = new Headers(request.headers);
    const ip = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || '127.0.0.1';
    const userAgent = requestHeaders.get('user-agent') || '';

    const visitorHash = generateVisitorHash(ip, userAgent);
    const deviceInfo = parseDeviceInfo(userAgent);
    const geoInfo = extractGeoInfo(requestHeaders);

    await query(`
      INSERT INTO vote_events (
        poll_id, vote_id, option_index, visitor_hash, session_id,
        device_type, browser_family, country_code, region_code,
        time_to_vote, is_first_vote_in_session, previous_option_viewed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      data.pollId,
      data.voteId,
      data.optionIndex,
      visitorHash,
      data.sessionId,
      deviceInfo.deviceType,
      deviceInfo.browserFamily,
      geoInfo.countryCode,
      geoInfo.regionCode,
      data.timeToVote,
      data.isFirstVoteInSession ?? true,
      data.previousOptionsViewed || []
    ]);

    // Update completion rate
    await updateCompletionRate(data.pollId);

  } catch (error) {
    console.error('Error tracking vote event:', error);
  }
}

/**
 * Track share event
 */
export async function trackShareEvent(data: ShareEventData, request: Request): Promise<void> {
  try {
    const requestHeaders = new Headers(request.headers);
    const ip = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || '127.0.0.1';
    const userAgent = requestHeaders.get('user-agent') || '';

    const visitorHash = generateVisitorHash(ip, userAgent);
    const deviceInfo = parseDeviceInfo(userAgent);
    const geoInfo = extractGeoInfo(requestHeaders);

    await query(`
      INSERT INTO share_events (
        poll_id, platform, share_method, visitor_hash, session_id,
        device_type, browser_family, country_code, region_code, shared_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      data.pollId,
      data.platform,
      data.shareMethod,
      visitorHash,
      data.sessionId,
      deviceInfo.deviceType,
      deviceInfo.browserFamily,
      geoInfo.countryCode,
      geoInfo.regionCode,
      data.sharedUrl
    ]);

    // Update share to vote ratio
    await updateShareToVoteRatio(data.pollId);

  } catch (error) {
    console.error('Error tracking share event:', error);
  }
}

/**
 * Track click event from shared links
 */
export async function trackClickEvent(data: ClickEventData, request: Request): Promise<void> {
  try {
    const requestHeaders = new Headers(request.headers);
    const ip = requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip') || '127.0.0.1';
    const userAgent = requestHeaders.get('user-agent') || '';

    const visitorHash = generateVisitorHash(ip, userAgent);
    const deviceInfo = parseDeviceInfo(userAgent);
    const geoInfo = extractGeoInfo(requestHeaders);

    const referrerDomain = data.referrer ? new URL(data.referrer).hostname : null;

    await query(`
      INSERT INTO click_events (
        poll_id, referrer_domain, utm_source, utm_medium, utm_campaign,
        visitor_hash, session_id, device_type, browser_family,
        country_code, region_code, converted_to_vote, time_to_conversion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      data.pollId,
      referrerDomain,
      data.utmParams?.source,
      data.utmParams?.medium,
      data.utmParams?.campaign,
      visitorHash,
      data.sessionId,
      deviceInfo.deviceType,
      deviceInfo.browserFamily,
      geoInfo.countryCode,
      geoInfo.regionCode,
      data.convertedToVote || false,
      data.timeToConversion
    ]);

  } catch (error) {
    console.error('Error tracking click event:', error);
  }
}

/**
 * Update unique viewers count for a poll
 */
async function updateUniqueViewers(pollId: string): Promise<void> {
  await query(`
    UPDATE poll_analytics
    SET unique_viewers = calculate_unique_viewers($1),
        updated_at = CURRENT_TIMESTAMP
    WHERE poll_id = $1
  `, [pollId]);
}

/**
 * Update completion rate for a poll
 */
async function updateCompletionRate(pollId: string): Promise<void> {
  await query(`
    UPDATE poll_analytics
    SET completion_rate = calculate_completion_rate($1),
        interaction_rate = CASE
          WHEN total_views > 0 THEN
            CAST(total_votes AS DECIMAL) / CAST(total_views AS DECIMAL)
          ELSE 0.0000
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE poll_id = $1
  `, [pollId]);
}

/**
 * Update share to vote ratio for a poll
 */
async function updateShareToVoteRatio(pollId: string): Promise<void> {
  await query(`
    UPDATE poll_analytics
    SET share_to_vote_ratio = CASE
          WHEN total_votes > 0 THEN
            CAST(total_shares AS DECIMAL) / CAST(total_votes AS DECIMAL)
          ELSE 0.0000
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE poll_id = $1
  `, [pollId]);
}

/**
 * Get comprehensive analytics for a poll
 */
export async function getPollAnalytics(pollId: string) {
  const result = await query(`
    SELECT * FROM poll_analytics_summary
    WHERE poll_id = $1
  `, [pollId]);

  return result.rows[0] || null;
}

/**
 * Get daily analytics for a specific date
 */
export async function getDailyAnalytics(pollId: string, date: Date = new Date()) {
  const result = await query(`
    SELECT * FROM aggregate_daily_analytics($1)
    WHERE poll_id = $2
  `, [date.toISOString().split('T')[0], pollId]);

  return result.rows[0] || null;
}

/**
 * Get analytics summary for multiple polls
 */
export async function getBulkAnalytics(pollIds: string[]) {
  if (pollIds.length === 0) return [];

  const placeholders = pollIds.map((_, i) => `$${i + 1}`).join(',');
  const result = await query(`
    SELECT * FROM poll_analytics_summary
    WHERE poll_id IN (${placeholders})
    ORDER BY total_views DESC
  `, pollIds);

  return result.rows;
}

/**
 * Track performance metrics for analytics operations
 */
export async function trackAnalyticsPerformance(
  operationType: string,
  tableName: string,
  executionTimeMs: number,
  rowCount: number = 0,
  error?: Error
) {
  try {
    await query(`
      INSERT INTO analytics_performance (
        operation_type, table_name, execution_time_ms, row_count,
        error_occurred, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      operationType,
      tableName,
      executionTimeMs,
      rowCount,
      !!error,
      error?.message || null
    ]);
  } catch (perfError) {
    console.error('Error tracking analytics performance:', perfError);
  }
}