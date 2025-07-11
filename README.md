# Poll.it - Modern Polling Application

A modern, full-stack polling application built with Next.js, React, Supabase, and Tailwind CSS. Create engaging polls, collect real-time responses, and analyze results with a beautiful, responsive interface.

## 🚀 Features

- **Real-time Polling**: Create and vote on polls with live result updates
- **Authentication**: Secure user authentication powered by Supabase
- **Anonymous Voting**: Support for anonymous users with rate limiting
- **Categories & Organization**: Organize polls by categories
- **Privacy Controls**: Public and private poll options with password protection
- **Admin Dashboard**: Comprehensive admin panel for user and poll management
- **Responsive Design**: Mobile-first, accessible interface
- **Performance Optimized**: React.memo optimization and efficient state management
- **Comprehensive Testing**: Full test suite with Jest and React Testing Library

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Heroicons** - Additional icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Database-level security policies
- **Real-time subscriptions** - Live data updates

### Development & Testing
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. Clone the repository
```bash
git clone https://github.com/awideweb/poll.it-new.git
cd poll.it-new
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Development Admin Credentials (Optional)
ADMIN_TEST_USERNAME=admin
ADMIN_TEST_PASSWORD=your-secure-password
```

### 4. Database Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations found in `/database-schema.sql` (if available)
3. Set up Row Level Security policies for your tables
4. Configure authentication providers as needed

### 5. Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## 🏗 Building for Production

### Build the application
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Run production build locally
```bash
npm run build && npm start
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── admin/          # Admin-specific components
│   ├── PollForm.tsx    # Poll creation form
│   ├── PollCard.tsx    # Poll display component
│   └── Footer.tsx      # Site footer
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── admin/          # Admin dashboard pages
│   ├── poll/           # Individual poll pages
│   └── index.tsx       # Homepage
├── hooks/              # Custom React hooks
│   ├── admin/          # Admin-specific hooks
│   ├── useRecentPolls.ts
│   └── useSharePoll.ts
├── utils/              # Utility functions
│   └── supabaseClient.ts
└── __tests__/          # Test files
    ├── components/     # Component tests
    └── api/           # API route tests
```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin operations
- `ADMIN_TEST_USERNAME`: Development admin username
- `ADMIN_TEST_PASSWORD`: Development admin password

### Supabase Setup
1. Create tables for: `polls`, `choices`, `votes`, `categories`, `profiles`
2. Set up authentication with your preferred providers
3. Configure Row Level Security policies
4. Set up real-time subscriptions for live updates

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
- **Netlify**: Configure build command as `npm run build`
- **Railway**: Use the provided Dockerfile
- **DigitalOcean App Platform**: Configure build and run commands

## 🔒 Security Considerations

- Environment variables are properly configured (no hardcoded secrets)
- Supabase RLS policies protect data access
- Rate limiting implemented for anonymous users
- Admin authentication required for sensitive operations
- Input validation and sanitization on all forms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Open a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with ❤️ by [talaat.dev](https://talaat.dev)
- Powered by [Supabase](https://supabase.com)
- UI components from [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev) and [Heroicons](https://heroicons.com)

---

**Happy polling!** 🗳️