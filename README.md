# pollit

A modern, full-stack polling app built with Next.js, React, Supabase, and TailwindCSS.

## Features
- Poll creation (public/private, categories)
- Live voting and results
- Admin panel for user and poll management
- Authentication (Supabase)
- Responsive, accessible UI

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run the development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm start
```

### 5. Run tests
```bash
npm test
```

### 6. Lint and format
```bash
npm run lint
npm run format
```

## Best Practices
- Use environment variables for all secrets/keys.
- Write and run tests for all components and pages.
- Use Prettier and ESLint to keep code clean and consistent.
- Use accessible HTML and ARIA attributes.
- Never commit `.env.local` or secrets.
- Deploy easily to Vercel, Netlify, or any Node.js host.

## Deploying
- Recommended: [Vercel](https://vercel.com/) (zero-config for Next.js)
- Or use Docker/Node.js hosting.

---

**Happy polling!** 