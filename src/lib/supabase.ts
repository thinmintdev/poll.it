import { createClient } from '@supabase/supabase-js'

// For Neon database setup - we'll use a direct PostgreSQL approach
// But keeping Supabase client structure for compatibility

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string
          question: string
          options: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          options: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          options?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_index: number
          voter_ip: string
          voted_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_index: number
          voter_ip: string
          voted_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_index?: number
          voter_ip?: string
          voted_at?: string
        }
      }
    }
  }
}
