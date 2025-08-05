# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Development**:
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database Management**:
- `npm run db:init` - Initialize/reset database with schema
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset database (alias for db:init)
- `npm run db:test` - Test database connection

**Load Testing**:
- `npm run load-test:quick` - Quick 20-second verification test
- `npm run load-test:standard` - Full 5-minute load test with realistic scenarios
- `npm run load-test:spike` - 10-second spike test with 200 users/second
- `npm run load-test:endurance` - 10-minute endurance test for memory leaks
- `npm run load-test:report` - Generate HTML report from test results

## Architecture Overview

This is a real-time polling application built with Next.js 15 (App Router), TypeScript, and NEON PostgreSQL database. The application uses a hybrid database setup with Supabase compatibility layer over direct PostgreSQL connections.

### Database Architecture

**Dual Database Strategy**: The application implements a Supabase-compatible interface (`src/lib/supabase.ts`) while using direct PostgreSQL connections (`src/lib/database.ts`) for NEON database integration. This allows for flexibility in deployment while maintaining consistent API patterns.

**Core Tables**:
- `polls`: Stores poll questions and options (JSON serialized)
- `votes`: Tracks individual votes with IP-based deduplication
- Unique constraint: `(poll_id, voter_ip)` prevents duplicate voting

### Real-time Architecture

**Socket.IO Integration**: Uses Next.js Pages API (`src/pages/api/socket.ts`) for WebSocket connections. Clients join poll-specific rooms (`poll-${pollId}`) for targeted real-time updates.

**Live Updates Flow**:
1. User votes via REST API
2. Vote recorded in database
3. Results updated and broadcast to poll room
4. All connected clients receive immediate updates

### API Structure

**RESTful Endpoints**:
- `POST /api/polls` - Create new poll
- `GET /api/polls/[id]` - Get poll details  
- `POST /api/polls/[id]/vote` - Submit vote (with IP deduplication)
- `GET /api/polls/[id]/results` - Get aggregated results

**Vote Validation**: IP-based voting restrictions with comprehensive validation (poll existence, option bounds, duplicate prevention).

### Frontend Architecture

**Component Structure**:
- `PollChart.tsx` - Chart.js doughnut visualization with 10-color palette
- `QRCodeDisplay.tsx` - QR code generation for mobile sharing
- `PollFeed.tsx` & `PollFeedInfiniteScroll.tsx` - Infinite scroll poll listing
- `ShareModal.tsx` - Social sharing with Twitter, Facebook, LinkedIn, and copy-to-clipboard
- `GoogleAnalytics.tsx` - Google Analytics 4 integration for tracking
- `RotatingText.tsx` - Animated text component using GSAP

**State Management**: React hooks with Socket.IO for real-time synchronization. No external state management library - uses local component state with WebSocket updates.

**Analytics Integration**: Google Analytics 4 and Vercel Analytics for tracking poll creation, voting, and sharing actions via custom `useAnalytics` hook.

**Responsive Design**: Mobile-first TailwindCSS implementation with responsive charts and optimized touch interactions.

### Type System

**Core Types** (`src/types/poll.ts`):
- `Poll` - Database poll structure
- `Vote` - Individual vote record
- `PollResults` - Aggregated results with percentages
- `CreatePollData` & `VoteData` - API request types

**Socket Types** (`src/types/socket.ts`):
- Extended Next.js API types for Socket.IO server integration

## Development Patterns

**Database Queries**: All database operations use parameterized queries through the `query()` function for SQL injection protection.

**Error Handling**: Comprehensive error handling with user-friendly messages and proper HTTP status codes.

**Validation**: Client-side and server-side validation for all user inputs (question length, option counts, vote constraints).

**Performance**: Chart.js refs for optimal re-rendering, infinite scroll for large datasets, and efficient database indexing.

## Environment Setup

**Required Environment Variables**:

```
DATABASE_URL=postgresql://...            # NEON database connection
NEXT_PUBLIC_SUPABASE_URL=https://...     # Supabase URL (optional)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # Supabase key (optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-...         # Google Analytics 4 tracking ID (optional)
```

**Database Schema**: Run `supabase-schema.sql` to initialize the database with proper tables, indexes, and triggers.

## Key Constraints

- **Voting Limits**: One vote per IP address per poll (enforced at database level)
- **Poll Options**: 2-10 options per poll, 100 characters max per option
- **Question Length**: 500 characters maximum
- **Multiple Selections**: Polls support single or multiple selection mode with configurable max selections
- **Real-time Updates**: 5-second polling fallback if Socket.IO fails

## Testing Approach

**Database Testing**: Use `scripts/test-db.js` to verify database connectivity and schema.

**Backup & Restore**: Use `scripts/backup-and-reset-db.js` to create timestamped JSON backups before resetting with sample data. Restore with `scripts/restore-backup.js`.

**Sample Data**: `scripts/create-sample-polls.js` for development data.

**Load Testing**: Comprehensive Artillery.js setup in `scripts/load-test/` with multiple test scenarios. Use `npm run load-test:quick` to verify setup before full testing.

**Manual Testing**: Focus on real-time updates, vote deduplication, and mobile responsiveness.

## Recent Updates

**Analytics & Tracking**: Integrated Google Analytics 4 and Vercel Analytics with custom event tracking for poll creation, voting, and sharing actions.

**Social Sharing**: Enhanced ShareModal with Twitter, Facebook, LinkedIn integration and improved copy-to-clipboard functionality.

**Multiple Selection Polls**: Added support for polls with multiple answer selections with configurable maximum selections.

**Load Testing Infrastructure**: Comprehensive Artillery.js setup with multiple test scenarios (quick, standard, spike, endurance) for performance validation.

**Backup & Restore**: Database backup functionality with timestamped JSON exports and restore capabilities.

**Design System**: Updated to "cotton-candy" color scheme defined in `global.css` with improved visual consistency.