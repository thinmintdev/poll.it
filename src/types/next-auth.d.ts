// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    provider?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string
    provider?: string
  }
}