import { NextRequest, NextResponse } from 'next/server';
import { query, trackAnalyticsPerformance } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { pollId, sessionId, timeOnPage, scrollDepth, optionHovers, clicks } = body;

    // Validate required fields
    if (!pollId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: pollId, sessionId' },
        { status: 400 }
      );
    }

    // Update the existing page view record with final session data
    await query(`
      UPDATE page_view_events
      SET
        time_on_page = COALESCE($3, time_on_page),
        scroll_depth = GREATEST(COALESCE(scroll_depth, 0), COALESCE($4, 0))
      WHERE poll_id = $1 AND session_id = $2
      AND time_on_page IS NULL
      ORDER BY viewed_at DESC
      LIMIT 1
    `, [pollId, sessionId, timeOnPage, scrollDepth]);

    // Store detailed session analytics if provided
    if (optionHovers && Object.keys(optionHovers).length > 0) {
      // Store option hover data for analysis
      for (const [optionIndex, hoverTime] of Object.entries(optionHovers)) {
        await query(`
          INSERT INTO vote_events (
            poll_id, vote_id, option_index, visitor_hash, session_id,
            device_type, browser_family, time_to_vote
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT DO NOTHING
        `, [
          pollId,
          `hover-${sessionId}-${optionIndex}`, // Synthetic ID for hover events
          parseInt(optionIndex),
          `session-${sessionId}`, // Use session as visitor hash for hover tracking
          sessionId,
          'hover_event',
          'hover_tracking',
          hoverTime
        ]);
      }
    }

    // Calculate and update average time metrics
    await query(`
      UPDATE poll_analytics
      SET
        avg_time_on_page = (
          SELECT AVG(time_on_page)::INTEGER
          FROM page_view_events
          WHERE poll_id = $1 AND time_on_page IS NOT NULL
        ),
        avg_time_to_vote = (
          SELECT AVG(time_to_vote)::INTEGER
          FROM vote_events
          WHERE poll_id = $1 AND time_to_vote IS NOT NULL
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE poll_id = $1
    `, [pollId]);

    // Track performance metrics
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance(
      'update',
      'page_view_events',
      executionTime,
      1
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    // Track error metrics
    await trackAnalyticsPerformance(
      'update',
      'page_view_events',
      executionTime,
      0,
      error as Error
    );

    console.error('Error updating session end data:', error);

    // Return success to avoid breaking user experience
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}