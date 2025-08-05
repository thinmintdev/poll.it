# Poll.it - Real-time Polling Application

A modern, full-stack polling application built with Next.js 15, featuring real-time updates, responsive design, and a sophisticated UI/UX implementation.

## 🔧 Technical Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion, GSAP
- **State Management**: React Hooks
- **UI Components**: Custom component library with gradient theming

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL with Supabase
- **Real-time**: Socket.IO for live poll updates
- **API**: RESTful endpoints with Next.js API routes

### Infrastructure
- **Hosting**: Vercel (Frontend), Supabase (Backend/DB)
- **CI/CD**: GitHub Actions integration
- **Environment**: Docker containerization support

## 🚀 Key Features

### Real-time Functionality
- Live poll results with WebSocket connections
- Instant vote aggregation and chart updates
- Multi-client synchronization

### Advanced UI/UX
- Custom "cotton candy" design system with gradient theming
- Responsive infinite scroll feed with GSAP animations
- Interactive charts (Pie/Bar) with Chart.js integration
- Motion-based micro-interactions throughout the application

### Technical Highlights
- **Type Safety**: Comprehensive TypeScript implementation
- **Performance**: Optimized with Next.js Image component and lazy loading
- **Accessibility**: WCAG-compliant form controls and navigation
- **Security**: IP-based vote limiting and input validation
- **SEO**: Server-side rendering with dynamic meta tags

## 📊 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   API Routes    │────│   Supabase DB   │
│   (Client)      │    │   (Server)      │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼─────────────────────────────────┐
                                 │                                 │
                    ┌─────────────────┐              ┌─────────────────┐
                    │   Socket.IO     │              │   Chart.js      │
                    │   (Real-time)   │              │   (Visualizations)│
                    └─────────────────┘              └─────────────────┘
```

## 🛠 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database (or Supabase account)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/thinmintdev/poll.it.git
   cd poll.it
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_database_connection_string
   ```

4. **Database setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── create/            # Poll creation page
│   ├── poll/[id]/         # Dynamic poll pages
│   └── globals.css        # Global styles & CSS variables
├── components/            # Reusable UI components
│   ├── PollCard.tsx       # Individual poll display
│   ├── PollChart.tsx      # Chart visualizations
│   └── InfiniteScroll.tsx # Custom infinite scroll implementation
├── lib/                   # Utility functions
│   ├── database.ts        # Database connection & queries
│   └── supabase.ts        # Supabase client configuration
├── types/                 # TypeScript type definitions
└── pages/api/socket.ts    # Socket.IO server implementation
```

## 🎨 Design System

### Color Palette
- **Cotton Candy Theme**: Custom gradient system with pink, purple, and blue variants
- **Dark Mode**: Sophisticated dark theme with carefully calibrated contrast ratios
- **Semantic Colors**: Consistent color tokens for states, feedback, and hierarchy

### Component Architecture
- **Atomic Design**: Modular component structure following atomic design principles
- **Responsive**: Mobile-first approach with breakpoint-specific optimizations
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🔄 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/polls` | GET | Retrieve paginated polls |
| `/api/polls` | POST | Create new poll |
| `/api/polls/[id]` | GET | Get specific poll data |
| `/api/polls/[id]/vote` | POST | Submit vote |
| `/api/polls/[id]/results` | GET | Get poll results |
| `/api/polls/feed` | GET | Get infinite scroll feed |

## 🧪 Testing & Quality

- **Type Checking**: Strict TypeScript configuration
- **Linting**: ESLint with custom rules for React/Next.js
- **Performance**: Lighthouse CI integration
- **Code Quality**: Prettier formatting and Husky pre-commit hooks

## 📈 Performance Optimizations

- **Bundle Analysis**: Webpack bundle analyzer integration
- **Image Optimization**: Next.js Image component with WebP conversion
- **Code Splitting**: Route-based and component-based code splitting
- **Caching**: API response caching and static asset optimization

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker build -t poll-it .
docker run -p 3000:3000 poll-it
```

## 📊 Metrics & Analytics

### Google Analytics Integration
- **Event Tracking**: Automatic tracking of poll creation, voting, and sharing actions
- **Page Views**: Tracks user navigation and engagement
- **Custom Events**: Poll-specific analytics for insights into user behavior
- **Environment Support**: Configurable via `NEXT_PUBLIC_GA_TRACKING_ID` environment variable

### Analytics Events Tracked:
- **Poll Creation**: `create_poll` - tracks when users create new polls
- **Voting**: `vote` - tracks poll participation with poll ID
- **Sharing**: `share` - tracks when users share polls (copy link, etc.)

### Setup:
1. Set your Google Analytics tracking ID in `.env.local`:
   ```
   NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
   ```
2. Analytics will automatically be enabled and start tracking user interactions

### Additional Metrics:
- Real-time user engagement tracking
- Poll participation analytics
- Performance monitoring with Core Web Vitals
- Error tracking and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Developer**: [Your Name]  
**Portfolio**: [Your Portfolio URL]  
**LinkedIn**: [Your LinkedIn]  
**Email**: [Your Email]

---

*Built with ❤️ using modern web technologies*
