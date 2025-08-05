# Poll.it - Real-time Polling Application

A modern, fast, and responsive polling application built with Next.js, React, TailwindCSS, and Supabase. Create polls instantly, share them via unique URLs, and watch real-time results with beautiful charts.

## ✨ Features

- 🚀 **Lightning Fast**: Create polls in under 30 seconds
- 📊 **Real-time Results**: Live updates with Chart.js visualizations
- 📱 **Mobile-First**: Responsive design that works on all devices
- 🔗 **Easy Sharing**: Unique URLs and QR codes for effortless sharing
- 🚫 **No Authentication**: Vote and view results without signing up
- 📈 **Live Analytics**: Real-time vote counts and percentages
- 🎨 **Beautiful UI**: Modern design with TailwindCSS

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes, Socket.io
- **Database**: PostgreSQL via Supabase
- **Charts**: Chart.js with react-chartjs-2
- **QR Codes**: qrcode.react
- **Real-time**: Socket.io for live updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd poll.it
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the SQL schema from \`supabase-schema.sql\` in your Supabase SQL editor

### 4. Configure environment variables

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update \`.env.local\` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 5. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating a Poll

1. Visit the homepage and click "Create a Poll"
2. Enter your question and add 2-10 options
3. Click "Create Poll" to generate a unique URL
4. Share the URL with your audience

### Voting

1. Visit a poll URL
2. Select your preferred option
3. Click "Vote" to submit
4. View real-time results immediately

### Sharing

- Copy the poll URL to share directly
- Use the QR code for easy mobile sharing
- Results update in real-time for all viewers

## 🏗 Project Structure

\`\`\`
src/
├── app/
│   ├── api/
│   │   └── polls/              # API routes for polls
│   ├── create/                 # Poll creation page
│   ├── poll/[id]/             # Individual poll pages
│   └── page.tsx               # Homepage
├── components/
│   ├── PollChart.tsx          # Chart.js visualization
│   └── QRCodeDisplay.tsx      # QR code component
├── lib/
│   └── supabase.ts            # Supabase client
├── pages/api/
│   └── socket.ts              # Socket.io configuration
└── types/
    ├── poll.ts                # Poll-related types
    └── socket.ts              # Socket types
\`\`\`

## 🔧 API Endpoints

- \`POST /api/polls\` - Create a new poll
- \`GET /api/polls/[id]\` - Get poll details
- \`POST /api/polls/[id]/vote\` - Submit a vote
- \`GET /api/polls/[id]/results\` - Get poll results

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🔒 Security Features

- IP-based vote limiting (one vote per IP per poll)
- SQL injection protection via Supabase
- XSS protection with React
- CORS configuration
- Rate limiting ready (can be added)

## 📊 Database Schema

### Polls Table
- \`id\` (UUID, Primary Key)
- \`question\` (Text)
- \`options\` (Text Array)
- \`created_at\` (Timestamp)
- \`updated_at\` (Timestamp)

### Votes Table
- \`id\` (UUID, Primary Key) 
- \`poll_id\` (UUID, Foreign Key)
- \`option_index\` (Integer)
- \`voter_ip\` (Text)
- \`voted_at\` (Timestamp)

## 🎨 Customization

### Styling
- Modify TailwindCSS classes in components
- Update color scheme in \`tailwind.config.js\`
- Add custom CSS in \`globals.css\`

### Features
- Add user authentication
- Implement poll expiration
- Add more chart types
- Enable poll editing
- Add comment systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

## 🌟 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Chart.js for beautiful visualizations
- TailwindCSS for the styling system
