import { NextRequest, NextResponse } from 'next/server';
import { trackVoteEvent, trackAnalyticsPerformance } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      pollId,
      voteId,
      optionIndex,
      sessionId,
      timeToVote,
      previousOptionsViewed,
      isFirstVoteInSession
    } = body;

    // Validate required fields
    if (!pollId || !voteId || optionIndex === undefined || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: pollId, voteId, optionIndex, sessionId' },
        { status: 400 }
      );
    }

    // Track the vote event
    await trackVoteEvent({
      pollId,
      voteId,
      optionIndex,
      sessionId,
      timeToVote,
      previousOptionsViewed,
      isFirstVoteInSession
    }, request);

    // Track performance metrics
    const executionTime = Date.now() - startTime;
    await trackAnalyticsPerformance(
      'insert',
      'vote_events',
      executionTime,
      1
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    const executionTime = Date.now() - startTime;

    // Track error metrics
    await trackAnalyticsPerformance(
      'insert',
      'vote_events',
      executionTime,
      0,
      error as Error
    );

    console.error('Error tracking vote event:', error);

    // Return success to avoid breaking user experience
    return NextResponse.json({ success: false, error: 'Internal server error' });
  }
}