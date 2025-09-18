import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { query } from '@/lib/database'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // First time sign in
      if (user && account && profile) {
        try {
          // Check if user exists in our database
          const existingUser = await query(
            'SELECT id FROM users WHERE provider = $1 AND provider_id = $2',
            [account.provider, account.providerAccountId]
          )

          let userId: string

          if (existingUser.rows.length > 0) {
            // User exists, update last login
            userId = existingUser.rows[0].id
            await query(
              'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
              [userId]
            )
          } else {
            // Create new user
            const newUser = await query(
              `INSERT INTO users (email, name, image, provider, provider_id)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING id`,
              [
                profile.email,
                profile.name,
                profile.image || user.image,
                account.provider,
                account.providerAccountId
              ]
            )
            userId = newUser.rows[0].id
          }

          token.sub = userId
          token.provider = account.provider
        } catch (error) {
          console.error('Database error during sign-in:', error)
          throw new Error('Database error during sign-in')
        }
      }

      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token.sub) {
        session.user.id = token.sub as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      console.log('New user created:', user.email)
    },
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}