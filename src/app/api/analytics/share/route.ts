import { NextRequest, NextResponse } from 'next/server';
import { trackShareEvent, trackAnalyticsPerformance } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { pollId, sessionId, platform, shareMethod, sharedUrl } = body;

    // Validate required fields
    if (!pollId || !sessionId || !platform || !shareMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: pollId, sessionId, platform, shareMethod' },
        { status: 400 }
      );
    }

    // Track the share event
    await trackShareEvent({
      pollId,
      sessionId,
      platform,
      shareMethod,
      sharedUrl
    }, request);

    // Track performance metrics
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance(
      'insert',
      'share_events',
      executionTime,
      1
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    // Track error metrics
    await trackAnalyticsPerformance(
      'insert',
      'share_events',
      executionTime,
      0,
      error as Error
    );

    console.error('Error tracking share event:', error);

    // Return success to avoid breaking user experience
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}