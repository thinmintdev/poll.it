import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { trackAnalyticsPerformance } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { pollId, sessionId, timeOnPage, scrollDepth, optionHovers, clicks } = body;

    if (!pollId || !sessionId) {
      return NextResponse.json(
        { error: 'Poll ID and session ID are required' },
        { status: 400 }
      );
    }

    // Update the page view event with session end data
    await query(`
      UPDATE page_view_events
      SET
        time_on_page = COALESCE($3, time_on_page),
        scroll_depth = COALESCE($4, scroll_depth),
        option_hovers = COALESCE($5, option_hovers),
        click_events = COALESCE($6, click_events),
        session_ended_at = CURRENT_TIMESTAMP
      WHERE poll_id = $1 AND session_id = $2
    `, [
      pollId,
      sessionId,
      timeOnPage,
      scrollDepth,
      optionHovers ? JSON.stringify(optionHovers) : null,
      clicks ? JSON.stringify(clicks) : null
    ]);

    // Track performance
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance('session_end', 'page_view_events', executionTime, 1);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating session end data:', error);

    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance('session_end', 'page_view_events', executionTime, 0, error as Error);

    return NextResponse.json(
      { error: 'Failed to update session data' },
      { status: 500 }
    );
  }
}