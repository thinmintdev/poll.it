import { NextRequest, NextResponse } from 'next/server';
import { getPollAnalytics, getDailyAnalytics, trackAnalyticsPerformance } from '@/lib/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  const startTime = Date.now();

  try {
    const { pollId } = params;
    const { searchParams } = new URL(request.url);
    const includeDaily = searchParams.get('daily') === 'true';
    const date = searchParams.get('date');

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }

    // Get comprehensive analytics
    const analytics = await getPollAnalytics(pollId);

    if (!analytics) {
      return NextResponse.json(
        { error: 'Poll not found or no analytics data available' },
        { status: 404 }
      );
    }

    // Get daily analytics if requested
    let dailyAnalytics = null;
    if (includeDaily) {
      const targetDate = date ? new Date(date) : new Date();
      dailyAnalytics = await getDailyAnalytics(pollId, targetDate);
    }

    // Track performance metrics
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance(
      'query',
      'poll_analytics_summary',
      executionTime,
      1
    );

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        dailyAnalytics: includeDaily ? dailyAnalytics : undefined
      }
    });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    // Track error metrics
    await trackAnalyticsPerformance(
      'query',
      'poll_analytics_summary',
      executionTime,
      0,
      error as Error
    );

    console.error('Error fetching poll analytics:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}