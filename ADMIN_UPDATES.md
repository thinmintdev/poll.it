# Poll.it Admin Panel

This admin panel allows administrators to manage polls, categories, users, and their own profile for the Poll.it application.

## Security Improvements

The admin authentication system has been completely revamped to ensure security in both development and production environments:

1. **Development Mode**: Uses a simplified mock authentication system with username/password for easy testing.
2. **Production Mode**: Uses real Supabase authentication with email/password and proper profile verification.
3. **No Mock Admin in Production**: The system explicitly prevents mock admin access tokens from being used in production.
4. **Service Role Integration**: Uses Supabase service role key for admin operations to bypass RLS policies when needed.

## API Endpoints

- `/api/admin/auth.ts`: Handles admin authentication and session management
- `/api/admin/check.ts`: Verifies admin sessions on app load
- `/api/admin/categories.ts`: CRUD operations for poll categories
- `/api/admin/users.ts`: CRUD operations for user management
- `/api/admin/polls.ts`: CRUD operations for polls
- `/api/admin/dbtest.ts`: Schema inspection tool for diagnosing database issues

## Database Setup

- Run the included `sample-polls-data.sql` script to reset and populate the polls table with entertaining sample data.
- The SQL handles both deletion of existing polls and creation of new ones with fun choices.

## New Features

1. **Enhanced Authentication**: Proper JWT handling with security checks in production
2. **Environment-aware Login**: Shows email login in production, username in development
3. **Supabase Client Utilities**: New helper functions in `supabaseClient.ts` for different auth contexts
4. **RLS Bypass**: Admin operations now properly bypass RLS using service role key

## Getting Started

1. Run the development server:

```bash
npm run dev
```

2. Access the admin panel at: http://localhost:3000/admin
3. Use the following credentials for development:
   - Username: admin
   - Password: password

## Production Deployment

For production, ensure these environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep this secret!)

The admin panel will automatically use the proper authentication flow in production.
