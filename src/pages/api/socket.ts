import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '@/types/socket';
import { SOCKET_CONFIG } from '@/constants/config';

/**
 * Socket.IO handler for real-time poll updates
 * 
 * This API route initializes the Socket.IO server and handles client connections.
 * It manages poll-specific rooms for targeted real-time updates and ensures
 * proper connection lifecycle management.
 * 
 * Features:
 * - Poll-specific rooms for targeted updates
 * - Connection lifecycle logging
 * - Graceful error handling
 * - Global server instance for API route access
 * 
 * @param req - Next.js API request object
 * @param res - Enhanced response object with Socket.IO server
 */
export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
): void {
  // Add request logging for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Socket.IO request: ${req.method} ${req.url}`);
  }

  // Check if Socket.IO server is already initialized
  if (res.socket.server.io) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Socket.IO server is already running');
    }
  } else {
    console.log('Initializing Socket.IO server...');
    
    try {
      // Initialize Socket.IO server with optimized configuration
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const io = new Server(res.socket.server as any, {
        path: SOCKET_CONFIG.PATH,
        addTrailingSlash: SOCKET_CONFIG.ADD_TRAILING_SLASH,
        // Performance and reliability configuration
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000, // 25 seconds
        // CORS configuration for production
        cors: {
          origin: process.env.NODE_ENV === 'production'
            ? [process.env.NEXT_PUBLIC_SITE_URL || 'https://poll.it.com', 'https://poll.it.com']
            : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
          methods: ['GET', 'POST'],
          credentials: true
        },
        // Transports configuration
        transports: ['websocket', 'polling'],
      });
      
      // Attach server to response object
      res.socket.server.io = io;
      
      // Store globally for access from API routes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).io = io;

      // Set up connection event handlers
      setupSocketEventHandlers(io);

      console.log('Socket.IO server initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Socket.IO server:', error);
      return res.status(500).json({ error: 'Failed to initialize Socket.IO server' });
    }
  }

  // Send success response for Socket.IO requests
  res.status(200).json({ status: 'ok' });
}

/**
 * Set up Socket.IO event handlers
 * 
 * Configures all socket event listeners including connection management,
 * poll room joining/leaving, and error handling.
 * 
 * @param io - Socket.IO server instance
 */
function setupSocketEventHandlers(io: Server): void {
  io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client connected: ${socket.id}`);
    }

    /**
     * Handle client joining a poll room
     * Creates poll-specific rooms for targeted real-time updates
     */
    socket.on('join-poll', (pollId: string) => {
      try {
        // Validate poll ID format (basic security)
        if (!isValidPollId(pollId)) {
          socket.emit('error', 'Invalid poll ID format');
          return;
        }
        
        const roomName = `${SOCKET_CONFIG.POLL_ROOM_PREFIX}${pollId}`;
        socket.join(roomName);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Client ${socket.id} joined ${roomName}`);
        }
        
        // Confirm successful join
        socket.emit('joined-poll', { pollId, roomName });
      } catch (error) {
        console.error(`Error joining poll ${pollId}:`, error);
        socket.emit('error', 'Failed to join poll');
      }
    });

    /**
     * Handle client leaving a poll room
     * Cleans up room membership when client navigates away
     */
    socket.on('leave-poll', (pollId: string) => {
      try {
        if (!isValidPollId(pollId)) {
          return; // Silently ignore invalid poll IDs on leave
        }
        
        const roomName = `${SOCKET_CONFIG.POLL_ROOM_PREFIX}${pollId}`;
        socket.leave(roomName);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Client ${socket.id} left ${roomName}`);
        }
      } catch (error) {
        console.error(`Error leaving poll ${pollId}:`, error);
      }
    });

    /**
     * Handle client disconnection
     * Automatic cleanup is handled by Socket.IO, but we log for monitoring
     */
    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
      }
    });

    /**
     * Handle connection errors
     */
    socket.on('error', (error) => {
      console.error(`Socket error from ${socket.id}:`, error);
    });
  });
  
  // Handle server-level errors
  io.on('error', (error) => {
    console.error('Socket.IO server error:', error);
  });
}

/**
 * Validate poll ID format to prevent injection attacks
 * 
 * @param pollId - Poll ID to validate
 * @returns Boolean indicating if poll ID is valid
 */
function isValidPollId(pollId: string): boolean {
  // Check if poll ID is a string and matches UUID format
  if (typeof pollId !== 'string' || pollId.length !== 36) {
    return false;
  }
  
  // Basic UUID format validation (8-4-4-4-12 pattern)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(pollId);
}
