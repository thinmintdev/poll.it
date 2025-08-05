import { Pool } from 'pg'

// Neon database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Database query function
export async function query(text: string, params?: any[]) {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

// For compatibility with existing Supabase-style code
export const db = {
  from: (table: string) => ({
    select: async (columns = '*') => {
      const result = await query(`SELECT ${columns} FROM ${table}`)
      return { data: result.rows, error: null }
    },
    insert: async (data: any) => {
      const keys = Object.keys(data)
      const values = Object.values(data)
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
      const columns = keys.join(', ')
      
      const result = await query(
        `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      )
      return { data: result.rows[0], error: null }
    },
    update: async (data: any) => ({
      eq: async (column: string, value: any) => {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ')
        
        const result = await query(
          `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
          [...values, value]
        )
        return { data: result.rows[0], error: null }
      }
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        const result = await query(`DELETE FROM ${table} WHERE ${column} = $1`, [value])
        return { data: null, error: null }
      }
    })
  })
}

export { pool }

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
