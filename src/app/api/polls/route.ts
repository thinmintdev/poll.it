import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';
import { CreatePollData } from '@/types/poll';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  POLL_CONFIG,
  HTTP_STATUS,
  ERROR_MESSAGES,
} from '@/constants/config';

/**
 * POST /api/polls - Create a new poll
 * 
 * Creates a new poll with the provided question and options.
 * Supports both text and image polls with single/multiple selection modes.
 * 
 * @param request - Next.js request object containing poll data
 * @returns JSON response with poll ID or error message
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user session (optional - allows anonymous polls)
    const session = await getServerSession(authOptions);

    // Parse and validate request body
    const body: CreatePollData = await request.json();
    const {
      question,
      description,
      options,
      pollType = 'text',
      imageOptions,
      allowMultipleSelections = POLL_CONFIG.DEFAULT_ALLOW_MULTIPLE,
      maxSelections = POLL_CONFIG.DEFAULT_MAX_SELECTIONS,
      commentsEnabled = false
    } = body;

    console.log('Received poll data:', {
      pollType,
      question,
      options,
      imageOptions,
      userId: session?.user?.id || 'anonymous'
    });

    // Validate required fields and basic constraints
    const validationError = validatePollCreationData({
      question,
      description,
      options,
      pollType,
      imageOptions,
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
    const userId = session?.user?.id || null;

    // Insert poll into database with proper error handling
    const result = await query(
      `INSERT INTO polls
       (id, question, description, options, poll_type, allow_multiple_selections, max_selections, user_id, comments_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [pollId, question, description || null, JSON.stringify(options), pollType, allowMultipleSelections, maxSelections, userId, commentsEnabled]
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

    // If it's an image poll, insert image options
    if (pollType === 'image' && imageOptions && imageOptions.length > 0) {
      try {
        for (let i = 0; i < imageOptions.length; i++) {
          const imageOption = imageOptions[i];
          await query(
            `INSERT INTO image_options 
             (id, poll_id, image_url, caption, order_index) 
             VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), pollId, imageOption.imageUrl, imageOption.caption || null, i]
          );
        }
      } catch (imageError) {
        // If image options insertion fails, clean up the poll
        await query('DELETE FROM polls WHERE id = $1', [pollId]);
        console.error('Error inserting image options:', imageError);
        return NextResponse.json(
          { error: 'Failed to create image poll options' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    }

    // Log successful poll creation (in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`${pollType} poll created successfully: ${poll.id}`);
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
  const { question, description, options, pollType = 'text', imageOptions, allowMultipleSelections, maxSelections } = data;
  
  // Check required fields
  if (!question) {
    return 'Question is required';
  }
  
  // Validate question length
  if (question.trim().length === 0 || question.length > POLL_CONFIG.MAX_QUESTION_LENGTH) {
    return `Question must be between 1 and ${POLL_CONFIG.MAX_QUESTION_LENGTH} characters`;
  }

  // Validate description length if provided
  if (description && description.length > 1000) {
    return 'Description must be 1000 characters or less';
  }

  // Validate poll type
  if (pollType !== 'text' && pollType !== 'image') {
    return 'Poll type must be either "text" or "image"';
  }

  // Validate based on poll type
  if (pollType === 'text') {
    // Text poll validation
    if (!options || !Array.isArray(options)) {
      return 'Options are required for text polls';
    }
    
    if (options.length < POLL_CONFIG.MIN_OPTIONS) {
      return `At least ${POLL_CONFIG.MIN_OPTIONS} options are required`;
    }
    
    if (options.length > POLL_CONFIG.MAX_OPTIONS) {
      return `Maximum ${POLL_CONFIG.MAX_OPTIONS} options allowed`;
    }
    
    // Validate each text option
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

  } else if (pollType === 'image') {
    // Image poll validation
    if (!imageOptions || !Array.isArray(imageOptions)) {
      return 'Image options are required for image polls';
    }
    
    if (imageOptions.length < POLL_CONFIG.MIN_OPTIONS) {
      return `At least ${POLL_CONFIG.MIN_OPTIONS} image options are required`;
    }
    
    if (imageOptions.length > POLL_CONFIG.MAX_OPTIONS) {
      return `Maximum ${POLL_CONFIG.MAX_OPTIONS} image options allowed`;
    }
    
    // Validate each image option
    for (let i = 0; i < imageOptions.length; i++) {
      const imageOption = imageOptions[i];
      
      if (!imageOption || !imageOption.imageUrl) {
        return `Image option ${i + 1} must have a valid image URL`;
      }
      
      // Validate image URL format
      if (!isValidImageUrl(imageOption.imageUrl)) {
        return `Image option ${i + 1} has an invalid image URL format`;
      }
      
      // Validate caption length if provided
      if (imageOption.caption && imageOption.caption.length > POLL_CONFIG.MAX_OPTION_LENGTH) {
        return `Image option ${i + 1} caption must be ${POLL_CONFIG.MAX_OPTION_LENGTH} characters or less`;
      }
    }

    // Check for duplicate image URLs
    const uniqueImageUrls = new Set(imageOptions.map(opt => opt.imageUrl.trim().toLowerCase()));
    if (uniqueImageUrls.size !== imageOptions.length) {
      return 'Duplicate image URLs are not allowed';
    }

    // Ensure options array matches image options length for compatibility
    if (!options || options.length !== imageOptions.length) {
      return 'Options array must match image options for data consistency';
    }
  }
  
  // Validate multiple selection settings
  const optionCount = pollType === 'text' ? options.length : imageOptions?.length || 0;
  if (allowMultipleSelections && maxSelections && maxSelections > optionCount) {
    return ERROR_MESSAGES.MAX_SELECTIONS_ERROR;
  }
  
  if (maxSelections && maxSelections < 1) {
    return 'Max selections must be at least 1';
  }
  
  return null; // No validation errors
}

/**
 * Validate image URL format
 * 
 * @param url - URL to validate
 * @returns true if valid image URL, false otherwise
 */
function isValidImageUrl(url: string): boolean {
  try {
    // Allow data URLs for uploaded images
    if (url.startsWith('data:image/')) {
      return true;
    }
    
    // Validate HTTP/HTTPS URLs with image extensions
    const urlObj = new URL(url);
    return /^https?:$/i.test(urlObj.protocol) && 
           /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
}
