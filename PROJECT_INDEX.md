# Project Index: Poll.it

Generated: 2026-03-12

## Project Structure

```
poll/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── polls/            # Poll CRUD + voting + comments APIs
│   │   │   │   ├── route.ts      # POST /api/polls (create)
│   │   │   │   ├── feed/route.ts # GET /api/polls/feed
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # GET /api/polls/:id
│   │   │   │       ├── vote/route.ts    # POST /api/polls/:id/vote
│   │   │   │       ├── results/route.ts # GET /api/polls/:id/results
│   │   │   │       ├── vote-status/route.ts
│   │   │   │       └── comments/route.ts
│   │   │   └── user/             # User APIs (polls, stats, settings)
│   │   ├── poll/[id]/            # Poll page (PollPageClient.tsx)
│   │   ├── dashboard/page.tsx    # User dashboard (server component)
│   │   ├── create/page.tsx       # Poll creation page
│   │   ├── auth/                 # Auth pages (signin, error)
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Homepage
│   │   └── globals.css           # Cotton-candy theme CSS
│   ├── components/
│   │   ├── PollChart.tsx         # Chart.js doughnut/bar visualization
│   │   ├── PollStats.tsx         # Views/votes/shares/status cards
│   │   ├── Comments.tsx          # Real-time discussion with Socket.IO
│   │   ├── Header.tsx            # Fixed header with logo + auth
│   │   ├── ShareModal.tsx        # Social sharing modal
│   │   ├── PollCard.tsx          # Poll card for feeds
│   │   ├── QRCodeDisplay.tsx     # QR code generation
│   │   ├── auth/
│   │   │   ├── AuthButton.tsx    # Login/avatar dropdown
│   │   │   ├── LoginModal.tsx    # OAuth login modal
│   │   │   └── SessionProvider.tsx
│   │   ├── dashboard/
│   │   │   ├── UserDashboard.tsx # Tab-based dashboard (overview/polls/settings)
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── PollManagement.tsx
│   │   │   └── UserSettings.tsx  # Profile settings
│   │   └── landing/              # Landing page sections
│   ├── lib/
│   │   ├── database.ts           # PostgreSQL (NEON) connection
│   │   ├── auth.ts               # NextAuth config (Google + GitHub)
│   │   └── supabase.ts           # Supabase compatibility layer
│   ├── pages/api/
│   │   ├── socket.ts             # Socket.IO server (WebSocket)
│   │   └── auth/[...nextauth].ts # NextAuth handler
│   ├── types/
│   │   ├── poll.ts               # Poll, Vote, PollResults, Comment types
│   │   ├── socket.ts             # Socket.IO types
│   │   └── next-auth.d.ts        # NextAuth type extensions
│   ├── constants/config.ts       # Centralized config constants
│   ├── hooks/useAnalytics.ts     # GA4 analytics hook
│   └── utils/ip.ts              # IP address utilities
├── scripts/                      # DB init, migration, backup, load tests
├── docs/                         # Auth setup docs
└── public/                       # SVG logos and assets
```

## Tech Stack

- **Framework**: Next.js 15 (App Router + Pages API for Socket.IO)
- **Language**: TypeScript
- **Database**: NEON PostgreSQL (via `pg`)
- **Auth**: NextAuth.js (Google + GitHub OAuth)
- **Real-time**: Socket.IO (WebSocket + polling fallback)
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: TailwindCSS v4 (cotton-candy theme)
- **Animation**: Framer Motion + GSAP
- **Analytics**: GA4 + Vercel Analytics

## Key Architecture Patterns

- **Dual DB strategy**: Supabase-compatible interface over direct pg
- **Real-time flow**: Vote → DB → Socket.IO broadcast → room subscribers
- **IP dedup**: One vote per IP per poll (DB unique constraint)
- **Privacy**: hide_results (none/until_vote/entirely)
- **Hybrid routing**: App Router for pages, Pages API for Socket.IO

## Known Issues / TODOs

- View tracking: hardcoded dummy data (views=1234, shares=89) in PollPageClient
- Poll creator attribution: always shows "by a guest" regardless of auth
- Bar chart legend: shows single "undefined" entry instead of option labels
- Discussion liveness: new comments may not appear without refresh
- Settings dropdown: links to /settings (doesn't exist) instead of dashboard settings tab
