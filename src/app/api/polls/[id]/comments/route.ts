import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import { CreateCommentData } from '@/types/poll';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '@/constants/config';

/**
 * GET /api/polls/[id]/comments - Get comments for a poll
 *
 * Retrieves all comments for a specific poll with user information.
 * Comments are ordered chronologically for proper chat flow.
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing poll ID
 * @returns JSON response with comments array or error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;

    // Verify poll exists and has comments enabled
    const pollResult = await query(
      'SELECT comments_enabled FROM polls WHERE id = $1',
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.POLL_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const poll = pollResult.rows[0];
    if (!poll.comments_enabled) {
      return NextResponse.json(
        { error: 'Comments are not enabled for this poll' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Get comments with user information
    const commentsResult = await query(
      `SELECT
        c.id,
        c.poll_id,
        c.user_id,
        c.content,
        c.parent_id,
        c.is_edited,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.image as user_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.poll_id = $1
      ORDER BY c.created_at ASC`,
      [pollId]
    );

    const comments = commentsResult.rows.map(row => ({
      id: row.id,
      poll_id: row.poll_id,
      user_id: row.user_id,
      user_name: row.user_name,
      user_image: row.user_image,
      content: row.content,
      parent_id: row.parent_id,
      is_edited: row.is_edited,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return NextResponse.json(
      { comments },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/polls/[id]/comments - Create a new comment
 *
 * Creates a new comment on a poll. Requires authentication and poll
 * must have comments enabled. Broadcasts new comment via Socket.IO.
 *
 * @param request - Next.js request object containing comment data
 * @param params - Route parameters containing poll ID
 * @returns JSON response with created comment or error message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;

    // Get user session (required for commenting)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to comment' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Parse and validate request body
    const body: CreateCommentData = await request.json();
    const { content, parent_id } = body;

    // Validate comment content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify poll exists and has comments enabled
    const pollResult = await query(
      'SELECT comments_enabled FROM polls WHERE id = $1',
      [pollId]
    );

    if (pollResult.rows.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.POLL_NOT_FOUND },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const poll = pollResult.rows[0];
    if (!poll.comments_enabled) {
      return NextResponse.json(
        { error: 'Comments are not enabled for this poll' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // If parent_id is provided, verify it exists
    if (parent_id) {
      const parentResult = await query(
        'SELECT id FROM comments WHERE id = $1 AND poll_id = $2',
        [parent_id, pollId]
      );

      if (parentResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
    }

    // Create the comment
    const commentId = uuidv4();
    await query(
      `INSERT INTO comments (id, poll_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [commentId, pollId, session.user.id, content.trim(), parent_id || null]
    );

    // Get the complete comment with user information
    const fullCommentResult = await query(
      `SELECT
        c.id,
        c.poll_id,
        c.user_id,
        c.content,
        c.parent_id,
        c.is_edited,
        c.created_at,
        c.updated_at,
        u.name as user_name,
        u.image as user_image
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = $1`,
      [commentId]
    );

    const comment = fullCommentResult.rows[0];
    const responseComment = {
      id: comment.id,
      poll_id: comment.poll_id,
      user_id: comment.user_id,
      user_name: comment.user_name,
      user_image: comment.user_image,
      content: comment.content,
      parent_id: comment.parent_id,
      is_edited: comment.is_edited,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };

    // Broadcast new comment to all clients in the poll room via Socket.IO
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const io = (global as any).io;
      if (io) {
        const roomName = `poll-${pollId}`;
        io.to(roomName).emit('newComment', responseComment);

        if (process.env.NODE_ENV === 'development') {
          console.log(`Broadcasted new comment to ${roomName} room`);
        }
      } else {
        console.log('Socket.IO instance not found - comment will not be broadcast in real-time');
      }
    } catch (error) {
      console.error('Failed to broadcast new comment:', error);
      // Don't fail the comment creation if broadcast fails
    }

    return NextResponse.json(
      { comment: responseComment },
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}