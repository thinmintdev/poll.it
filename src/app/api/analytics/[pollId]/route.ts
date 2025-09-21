import { NextRequest, NextResponse } from 'next/server';
import { getPollAnalytics, getDailyAnalytics, trackAnalyticsPerformance } from '@/lib/analytics';

// Define response type structure
interface AnalyticsResponse {
  poll_id: string;
  summary: {
    total_views: number;
    unique_viewers: number;
    total_votes: number;
    total_shares: number;
    completion_rate: number;
    bounce_rate: number;
    viral_coefficient: number;
    share_to_vote_ratio: number;
    avg_time_on_page: number;
    avg_time_to_vote: number;
    return_visitor_rate: number;
    interaction_rate: number;
  };
  geographic: {
    top_countries: string[];
    country_breakdown: Record<string, number>;
  };
  devices: {
    device_breakdown: Record<string, number>;
    browser_breakdown: Record<string, number>;
    os_breakdown: Record<string, number>;
  };
  sharing: {
    share_breakdown: Record<string, number>;
    viral_metrics: {
      reach_multiplier: number;
      social_amplification: number;
      engagement_virality: number;
    };
  };
  temporal: {
    last_updated: string;
    created_at: string;
  };
  daily?: {
    date: string;
    views: number;
    votes: number;
    shares: number;
    unique_visitors: number;
    completion_rate: number;
    avg_time_on_page: number;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  const startTime = Date.now();

  try {
    const { pollId } = await params;
    const { searchParams } = new URL(request.url);
    const includeDaily = searchParams.get('daily') === 'true';
    const date = searchParams.get('date');

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    // Get basic analytics
    const analytics = await getPollAnalytics(pollId);
    if (!analytics) {
      return NextResponse.json(
        { error: 'Poll not found or no analytics available' },
        { status: 404 }
      );
    }

    const response: AnalyticsResponse = {
      poll_id: analytics.poll_id,
      summary: {
        total_views: analytics.total_views || 0,
        unique_viewers: analytics.unique_viewers || 0,
        total_votes: analytics.total_votes || 0,
        total_shares: analytics.total_shares || 0,
        completion_rate: analytics.completion_rate || 0,
        bounce_rate: analytics.bounce_rate || 0,
        viral_coefficient: analytics.viral_coefficient || 0,
        share_to_vote_ratio: analytics.share_to_vote_ratio || 0,
        avg_time_on_page: analytics.avg_time_on_page || 0,
        avg_time_to_vote: analytics.avg_time_to_vote || 0,
        return_visitor_rate: analytics.return_visitor_rate || 0,
        interaction_rate: analytics.interaction_rate || 0
      },
      geographic: {
        top_countries: analytics.top_countries || [],
        country_breakdown: analytics.country_breakdown || {}
      },
      devices: {
        device_breakdown: analytics.device_breakdown || {},
        browser_breakdown: analytics.browser_breakdown || {},
        os_breakdown: analytics.os_breakdown || {}
      },
      sharing: {
        share_breakdown: analytics.share_breakdown || {},
        viral_metrics: {
          reach_multiplier: analytics.viral_coefficient || 0,
          social_amplification: (analytics.total_shares || 0) / Math.max(analytics.total_votes || 1, 1),
          engagement_virality: (analytics.total_shares || 0) / Math.max(analytics.total_views || 1, 1)
        }
      },
      temporal: {
        last_updated: analytics.updated_at,
        created_at: analytics.created_at
      }
    };

    // Include daily analytics if requested
    if (includeDaily) {
      const targetDate = date ? new Date(date) : new Date();
      const dailyAnalytics = await getDailyAnalytics(pollId, targetDate);

      if (dailyAnalytics) {
        response.daily = {
          date: targetDate.toISOString().split('T')[0],
          views: dailyAnalytics.views || 0,
          votes: dailyAnalytics.votes || 0,
          shares: dailyAnalytics.shares || 0,
          unique_visitors: dailyAnalytics.unique_visitors || 0,
          completion_rate: dailyAnalytics.completion_rate || 0,
          avg_time_on_page: dailyAnalytics.avg_time_on_page || 0
        };
      }
    }

    // Track performance
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance('fetch_analytics', 'poll_analytics_summary', executionTime, 1);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 5 min browser, 10 min CDN
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);

    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance('fetch_analytics', 'poll_analytics_summary', executionTime, 0, error as Error);

    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}