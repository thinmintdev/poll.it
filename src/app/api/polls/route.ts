import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import { CreatePollData } from '@/types/poll';
import { 
  POLL_CONFIG, 
  HTTP_STATUS, 
  ERROR_MESSAGES,
} from '@/constants/config';

/**
 * POST /api/polls - Create a new poll
 * 
 * Creates a new poll with the provided question and options.
 * Supports both single and multiple selection polls with configurable limits.
 * 
 * @param request - Next.js request object containing poll data
 * @returns JSON response with poll ID or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: CreatePollData = await request.json();
    const { 
      question, 
      options, 
      allowMultipleSelections = POLL_CONFIG.DEFAULT_ALLOW_MULTIPLE, 
      maxSelections = POLL_CONFIG.DEFAULT_MAX_SELECTIONS 
    } = body;

    // Validate required fields and basic constraints
    const validationError = validatePollCreationData({
      question,
      options,
      allowMultipleSelections,
      maxSelections,
    });
    
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate unique poll ID
    const pollId = uuidv4();
    
    // Insert poll into database with proper error handling
    const result = await query(
      `INSERT INTO polls 
       (id, question, options, allow_multiple_selections, max_selections) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [pollId, question, JSON.stringify(options), allowMultipleSelections, maxSelections]
    );

    const poll = result.rows[0];

    // Verify poll was created successfully
    if (!poll) {
      console.error('Poll creation failed - no record returned from database');
      return NextResponse.json(
        { error: ERROR_MESSAGES.POLL_CREATION_FAILED },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Log successful poll creation (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Poll created successfully: ${poll.id}`);
    }

    return NextResponse.json(
      { pollId: poll.id }, 
      { status: HTTP_STATUS.CREATED }
    );
  } catch (error) {
    // Log error with context for debugging
    console.error('Error creating poll:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Validate poll creation data
 * 
 * Performs comprehensive validation of poll creation parameters
 * to ensure data integrity and business rule compliance.
 * 
 * @param data - Poll creation data to validate
 * @returns Error message if validation fails, null if valid
 */
function validatePollCreationData(data: CreatePollData): string | null {
  const { question, options, allowMultipleSelections, maxSelections } = data;
  
  // Check required fields
  if (!question || !options) {
    return ERROR_MESSAGES.POLL_VALIDATION_ERROR;
  }
  
  // Validate question length
  if (question.trim().length === 0 || question.length > POLL_CONFIG.MAX_QUESTION_LENGTH) {
    return `Question must be between 1 and ${POLL_CONFIG.MAX_QUESTION_LENGTH} characters`;
  }
  
  // Validate options array
  if (!Array.isArray(options) || options.length < POLL_CONFIG.MIN_OPTIONS) {
    return ERROR_MESSAGES.POLL_VALIDATION_ERROR;
  }
  
  if (options.length > POLL_CONFIG.MAX_OPTIONS) {
    return `Maximum ${POLL_CONFIG.MAX_OPTIONS} options allowed`;
  }
  
  // Validate each option
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (!option || typeof option !== 'string' || option.trim().length === 0) {
      return `Option ${i + 1} cannot be empty`;
    }
    if (option.length > POLL_CONFIG.MAX_OPTION_LENGTH) {
      return `Option ${i + 1} must be ${POLL_CONFIG.MAX_OPTION_LENGTH} characters or less`;
    }
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(options.map(opt => opt.trim().toLowerCase()));
  if (uniqueOptions.size !== options.length) {
    return 'Duplicate options are not allowed';
  }
  
  // Validate multiple selection settings
  if (allowMultipleSelections && maxSelections && maxSelections > options.length) {
    return ERROR_MESSAGES.MAX_SELECTIONS_ERROR;
  }
  
  if (maxSelections && maxSelections < 1) {
    return 'Max selections must be at least 1';
  }
  
  return null; // No validation errors
}
