import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { getClientIP } from '@/utils/ip';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/constants/config';

/**
 * GET /api/polls/[id]/vote-status - Check if the current user has voted on a poll
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;

    // Get voter IP using secure utility function
    const voterIp = getClientIP(request);

    // Verify poll exists
    const pollResult = await query(
      'SELECT allow_multiple_selections FROM polls WHERE id = $1',
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.POLL_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const poll = pollResult.rows[0];
    const allowMultiple = poll.allow_multiple_selections || false;

    // Check if this IP has voted on this poll
    const existingVotesResult = await query(
      'SELECT option_index FROM votes WHERE poll_id = $1 AND voter_ip = $2',
      [pollId, voterIp]
    );

    const hasVoted = existingVotesResult.rows.length > 0;
    const votedOptions = existingVotesResult.rows.map(row => row.option_index);

    return NextResponse.json({
      hasVoted,
      votedOptions,
      allowMultiple
    });

  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}