/**
 * Application Configuration Constants
 * 
 * This file centralizes all hardcoded values, magic numbers, and configuration
 * settings to improve maintainability and make the codebase more flexible.
 */

// ===== POLL CONFIGURATION =====
export const POLL_CONFIG = {
  /** Minimum number of options required for a poll */
  MIN_OPTIONS: 2,
  
  /** Maximum number of options allowed for a poll */
  MAX_OPTIONS: 10,
  
  /** Maximum character length for poll questions */
  MAX_QUESTION_LENGTH: 500,
  
  /** Maximum character length for each option */
  MAX_OPTION_LENGTH: 100,
  
  /** Default value for allowing multiple selections */
  DEFAULT_ALLOW_MULTIPLE: false,
  
  /** Default maximum selections when multiple selection is enabled */
  DEFAULT_MAX_SELECTIONS: 1,
} as const;

// ===== DATABASE CONFIGURATION =====
export const DATABASE_CONFIG = {
  /** SSL configuration for database connections */
  SSL_CONFIG: {
    rejectUnauthorized: false,
  },
  
  /** Default columns for SELECT queries */
  DEFAULT_SELECT_COLUMNS: '*',
} as const;

// ===== CHART CONFIGURATION =====
export const CHART_CONFIG = {
  /** Chart height in CSS units */
  HEIGHT: 'h-64',
  
  /** Chart colors for poll options (up to 10 colors) */
  BACKGROUND_COLORS: [
    '#525CEB', // accent
    '#BFCFE7', // highlight
    '#FFBCBC', // highlight-alt
    '#6366F1', // indigo-500
    '#8B5CF6', // purple-500
    '#EC4899', // pink-500
    '#F59E0B', // amber-500
    '#10B981', // emerald-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
  ] as const,
  
  /** Border colors for chart elements */
  BORDER_COLORS: [
    '#4338CA', // accent darker
    '#93C5FD', // highlight darker
    '#FCA5A5', // highlight-alt darker
    '#4F46E5', // indigo-600
    '#7C3AED', // purple-600
    '#DB2777', // pink-600
    '#D97706', // amber-600
    '#059669', // emerald-600
    '#0891B2', // cyan-600
    '#65A30D', // lime-600
  ] as const,
  
  /** Chart styling configuration */
  STYLING: {
    borderWidth: 2,
    legendPadding: 30,
    legendBoxSize: 12,
    fontSize: 12,
    textColor: '#EDF2F6',
    gridColor: '#494953',
  },
} as const;

// ===== SOCKET.IO CONFIGURATION =====
export const SOCKET_CONFIG = {
  /** Socket.IO server path */
  PATH: '/api/socket',
  
  /** Whether to add trailing slash to socket path */
  ADD_TRAILING_SLASH: false,
  
  /** Room name prefix for poll-specific rooms */
  POLL_ROOM_PREFIX: 'poll-',
} as const;

// ===== HTTP STATUS CODES =====
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ===== ERROR MESSAGES =====
export const ERROR_MESSAGES = {
  // Poll creation errors
  POLL_VALIDATION_ERROR: 'Question and at least 2 options are required',
  MAX_SELECTIONS_ERROR: 'Max selections cannot exceed number of options',
  POLL_CREATION_FAILED: 'Failed to create poll',
  
  // Vote submission errors
  INVALID_OPTION_INDEX: 'Valid option index(es) required',
  POLL_NOT_FOUND: 'Poll not found',
  SINGLE_SELECTION_ONLY: 'This poll only allows single selection',
  MAX_SELECTIONS_EXCEEDED: 'selections allowed', // This will be prefixed with "Maximum X"
  INVALID_OPTION: 'Invalid option index',
  DUPLICATE_SELECTIONS: 'Duplicate selections not allowed',
  ALREADY_VOTED: 'You have already voted on this poll',
  ALREADY_VOTED_OPTIONS: 'You have already voted for one or more of these options',
  EXCEEDS_MAX_SELECTIONS: 'Adding these selections would exceed the maximum of', // Will be suffixed with count
  
  // Generic errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;

// ===== SUCCESS MESSAGES =====
export const SUCCESS_MESSAGES = {
  VOTE_RECORDED: 'Vote recorded successfully',
} as const;

// ===== ANALYTICS CONFIGURATION =====
export const ANALYTICS_CONFIG = {
  /** Event categories */
  CATEGORIES: {
    ENGAGEMENT: 'engagement',
    SOCIAL: 'social',
  },
  
  /** Event actions */
  ACTIONS: {
    CREATE_POLL: 'create_poll',
    VOTE: 'vote',
    SHARE: 'share',
  },
} as const;

// ===== IP ADDRESS CONFIGURATION =====
export const IP_CONFIG = {
  /** Headers to check for client IP address */
  HEADERS: {
    X_FORWARDED_FOR: 'x-forwarded-for',
    X_REAL_IP: 'x-real-ip',
  },
  
  /** Fallback IP when real IP cannot be determined */
  FALLBACK_IP: 'unknown',
} as const;

// ===== TYPE EXPORTS FOR BETTER TYPE SAFETY =====
export type PollConfigKey = keyof typeof POLL_CONFIG;
export type ChartColor = typeof CHART_CONFIG.BACKGROUND_COLORS[number];
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];