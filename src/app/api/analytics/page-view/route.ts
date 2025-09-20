import { NextRequest, NextResponse } from 'next/server';
import { trackPageView, trackAnalyticsPerformance } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { pollId, sessionId, referrer, utmParams, timeOnPage, scrollDepth } = body;

    // Validate required fields
    if (!pollId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: pollId, sessionId' },
        { status: 400 }
      );
    }

    // Track the page view event
    await trackPageView({
      pollId,
      sessionId,
      timeOnPage,
      scrollDepth,
      referrer,
      utmParams
    }, request);

    // Track performance metrics
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance(
      'insert',
      'page_view_events',
      executionTime,
      1
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    // Track error metrics
    await trackAnalyticsPerformance(
      'insert',
      'page_view_events',
      executionTime,
      0,
      error as Error
    );

    console.error('Error tracking page view:', error);

    // Return success to avoid breaking user experience
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}