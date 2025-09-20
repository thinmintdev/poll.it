import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { trackVoteEvent } from '@/lib/analytics';
import { v4 as uuidv4 } from 'uuid';
import { VoteData } from '@/types/poll';
import { getClientIP } from '@/utils/ip';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SOCKET_CONFIG,
} from '@/constants/config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params
    const body: VoteData = await request.json()
    const { optionIndex } = body

    // Handle both single and multiple selections
    const optionIndices = Array.isArray(optionIndex) ? optionIndex : [optionIndex]

    // Validate option indices
    const validationError = validateVoteData(optionIndices);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Get voter IP using secure utility function
    const voterIp = getClientIP(request);

    // Verify poll exists and get poll settings
    const pollResult = await query(
      'SELECT options, poll_type, allow_multiple_selections, max_selections, hide_results FROM polls WHERE id = $1',
      [pollId]
    )

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.POLL_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const poll = pollResult.rows[0]
    let options = poll.options
    if (typeof options === 'string') {
      options = JSON.parse(options)
    }

    const allowMultiple = poll.allow_multiple_selections || false
    const maxSelections = poll.max_selections || 1
    const isImagePoll = poll.poll_type === 'image'
    const hideResults = poll.hide_results || 'none'

    // For image polls, get the total number of image options
    let totalOptions = options.length
    if (isImagePoll) {
      const imageOptionsResult = await query(
        'SELECT COUNT(*) as count FROM image_options WHERE poll_id = $1',
        [pollId]
      )
      totalOptions = parseInt(imageOptionsResult.rows[0].count)
    }

    // Validate selection rules against poll configuration
    const selectionError = validateSelectionRules({
      optionIndices,
      allowMultiple,
      maxSelections,
      totalOptions,
    });

    if (selectionError) {
      return NextResponse.json(
        { error: selectionError },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if this IP has already voted on this poll (for single selection polls)
    // For multiple selection polls, check if they've already voted for these specific options
    let isFirstVoteInSession = true;

    if (!allowMultiple) {
      const existingVoteResult = await query(
        'SELECT id FROM votes WHERE poll_id = $1 AND voter_ip = $2',
        [pollId, voterIp]
      )

      if (existingVoteResult.rows.length > 0) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.ALREADY_VOTED },
          { status: HTTP_STATUS.CONFLICT }
        );
      }
    } else {
      // For multiple selection polls, check if they've already voted for any of these options
      const existingVotesResult = await query(
        'SELECT option_index FROM votes WHERE poll_id = $1 AND voter_ip = $2',
        [pollId, voterIp]
      )

      const existingIndices = existingVotesResult.rows.map(row => row.option_index)
      const alreadyVoted = optionIndices.some(idx => existingIndices.includes(idx))

      // User has voted before if they have any existing votes
      isFirstVoteInSession = existingIndices.length === 0;

      if (alreadyVoted) {
        return NextResponse.json(
          { error: ERROR_MESSAGES.ALREADY_VOTED_OPTIONS },
          { status: HTTP_STATUS.CONFLICT }
        );
      }

      // Check if adding these votes would exceed max selections
      const totalSelections = existingIndices.length + optionIndices.length
      if (totalSelections > maxSelections) {
        return NextResponse.json(
          { error: `${ERROR_MESSAGES.EXCEEDS_MAX_SELECTIONS} ${maxSelections} selections` },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    // Record the votes and track analytics
    const voteIds = [];
    for (const idx of optionIndices) {
      const voteId = uuidv4();
      voteIds.push(voteId);

      await query(
        'INSERT INTO votes (id, poll_id, option_index, voter_ip) VALUES ($1, $2, $3, $4)',
        [voteId, pollId, idx, voterIp]
      )

      // Track vote analytics for each option (async, non-blocking)
      try {
        const sessionId = request.headers.get('x-session-id') || voteId;
        const timeToVote = request.headers.get('x-time-to-vote') ?
          parseInt(request.headers.get('x-time-to-vote')!) : undefined;

        await trackVoteEvent({
          pollId,
          voteId,
          optionIndex: idx,
          sessionId,
          timeToVote,
          isFirstVoteInSession: isFirstVoteInSession && idx === optionIndices[0]
        }, request);
      } catch (analyticsError) {
        console.warn('Analytics tracking failed for vote:', analyticsError);
        // Don't fail the vote if analytics fails
      }
    }

    // Get updated results and broadcast to all clients in the poll room
    const resultsQuery = await query(`
      SELECT
        option_index,
        COUNT(*) as votes
      FROM votes
      WHERE poll_id = $1
      GROUP BY option_index
      ORDER BY option_index
    `, [pollId])

    const totalVotes = resultsQuery.rows.reduce((sum, row) => sum + parseInt(row.votes), 0)

    // Build results array based on poll type
    const results = []
    for (let index = 0; index < totalOptions; index++) {
      const voteData = resultsQuery.rows.find(row => row.option_index === index)
      const votes = voteData ? parseInt(voteData.votes) : 0
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0
      results.push({ votes, percentage })
    }

    // Broadcast updated results to all clients in the poll room
    // Only broadcast if results are not hidden
    try {
      // Access the socket.io instance from the global store
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const io = (global as any).io
      if (io && hideResults === 'none') {
        // Only broadcast results if they're not hidden
        const roomName = `${SOCKET_CONFIG.POLL_ROOM_PREFIX}${pollId}`;
        io.to(roomName).emit('pollResults', {
          totalVotes,
          results
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`Broadcasted poll results to ${roomName} room`);
        }
      } else if (io && hideResults !== 'none') {
        // For hidden results, broadcast a signal that results were updated but don't include data
        const roomName = `${SOCKET_CONFIG.POLL_ROOM_PREFIX}${pollId}`;
        io.to(roomName).emit('pollVoteReceived', {
          pollId,
          hideResults: true
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(`Broadcasted vote received signal to ${roomName} room (results hidden)`);
        }
      } else {
        console.log('Socket.IO instance not found - results will not be broadcast in real-time')
      }
    } catch (error) {
      console.error('Failed to broadcast poll results:', error)
      // Don't fail the vote if broadcast fails
    }

    return NextResponse.json(
      {
        success: true,
        voteIds: voteIds // Return vote IDs for analytics correlation
      },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error recording vote:', error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Validate vote data structure and basic constraints
 *
 * @param optionIndices - Array of option indices to validate
 * @returns Error message if validation fails, null if valid
 */
function validateVoteData(optionIndices: number[]): string | null {
  if (!Array.isArray(optionIndices) || optionIndices.length === 0) {
    return ERROR_MESSAGES.INVALID_OPTION_INDEX;
  }

  // Check for invalid indices (negative numbers, undefined, null)
  if (optionIndices.some(idx => idx === undefined || idx === null || idx < 0)) {
    return ERROR_MESSAGES.INVALID_OPTION_INDEX;
  }

  // Check for non-integer indices
  if (optionIndices.some(idx => !Number.isInteger(idx))) {
    return ERROR_MESSAGES.INVALID_OPTION_INDEX;
  }

  return null;
}

/**
 * Validate selection rules against poll configuration
 *
 * @param params - Object containing validation parameters
 * @returns Error message if validation fails, null if valid
 */
function validateSelectionRules(params: {
  optionIndices: number[];
  allowMultiple: boolean;
  maxSelections: number;
  totalOptions: number;
}): string | null {
  const { optionIndices, allowMultiple, maxSelections, totalOptions } = params;

  // Check if poll allows multiple selections but user provided multiple
  if (!allowMultiple && optionIndices.length > 1) {
    return ERROR_MESSAGES.SINGLE_SELECTION_ONLY;
  }

  // Check if user exceeded maximum allowed selections
  if (allowMultiple && optionIndices.length > maxSelections) {
    return `Maximum ${maxSelections} ${ERROR_MESSAGES.MAX_SELECTIONS_EXCEEDED}`;
  }

  // Check if all option indices are within valid range
  if (optionIndices.some(idx => idx >= totalOptions)) {
    return ERROR_MESSAGES.INVALID_OPTION;
  }

  // Check for duplicate selections
  if (new Set(optionIndices).size !== optionIndices.length) {
    return ERROR_MESSAGES.DUPLICATE_SELECTIONS;
  }

  return null;
}