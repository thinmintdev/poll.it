# Authentication Setup Guide

This guide will help you set up OAuth authentication with Google and GitHub for the Poll.it application.

## Prerequisites

- Node.js and npm installed
- PostgreSQL database (NEON) configured
- Google and GitHub developer accounts

## 1. Database Setup

First, initialize the authentication database schema:

```bash
npm run db:auth
```

This will create the necessary tables for user accounts, sessions, and OAuth providers.

## 2. OAuth Provider Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret

### GitHub OAuth Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/applications/new)
2. Create a new OAuth App with:
   - Application name: `Poll.it`
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and generate a Client Secret

## 3. Environment Configuration

Copy `.env.example` to `.env.local` and update the following variables:

```env
# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 4. Start the Application

```bash
npm run dev
```

## 5. Test Authentication

1. Navigate to `http://localhost:3000`
2. Click "Sign In" in the header
3. Test both Google and GitHub login flows
4. After signing in, check the dashboard at `/dashboard`

## Features

### User Authentication
- **Social Login**: Google and GitHub OAuth
- **Session Management**: Secure JWT-based sessions
- **User Profiles**: Store user name, email, and profile image

### Poll Ownership
- **Anonymous Polls**: Users can create polls without signing in
- **Owned Polls**: Authenticated users can track their polls
- **Privacy Controls**: Public/private poll settings
- **Access Control**: Only poll owners can view private polls

### User Dashboard
- **Poll Management**: View, edit, and manage your polls
- **Statistics**: Track votes, engagement, and poll performance
- **Quick Actions**: Create new polls, copy poll links
- **Recent Activity**: View recent polls and voting trends

## Database Schema

The authentication system adds these tables:

- `users` - User account information from OAuth providers
- Updated `polls` table with `user_id` foreign key for poll ownership

Note: This implementation uses JWT sessions for simplicity, so no additional session tables are needed.

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in page
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### User Data
- `GET /api/user/polls` - Get user's polls
- `GET /api/user/stats` - Get user statistics

### Poll Management
- `POST /api/polls` - Create poll (optionally associated with user)
- `GET /api/polls/[id]` - Get poll (respects privacy settings)

## Security Features

- **CSRF Protection**: Built-in CSRF protection
- **Secure Sessions**: HTTP-only cookies
- **Database Security**: Parameterized queries prevent SQL injection
- **Access Control**: Role-based access to private polls
- **Rate Limiting**: Built-in protection against abuse

## Deployment Considerations

### Production Environment Variables

Update these for production:

```env
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=production-google-client-id
GITHUB_CLIENT_ID=production-github-client-id
```

### OAuth Redirect URIs

Add production callback URLs to your OAuth applications:
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

## Troubleshooting

### Common Issues

1. **OAuth Error: redirect_uri_mismatch**
   - Ensure callback URLs match exactly in OAuth provider settings
   - Check NEXTAUTH_URL environment variable

2. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Run `npm run db:test` to test connection
   - Ensure auth schema is initialized with `npm run db:auth`

3. **Session Not Persisting**
   - Check NEXTAUTH_SECRET is set and consistent
   - Verify cookies are not being blocked

### Debug Mode

Enable debug logging in development:

```env
NEXTAUTH_DEBUG=true
```

This will provide detailed logs for authentication flows and help diagnose issues.

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)