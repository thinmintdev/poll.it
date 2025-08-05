import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DATABASE_CONFIG } from '@/constants/config';

/**
 * Database connection pool configuration
 * 
 * Uses connection pooling for better performance and resource management.
 * The pool automatically handles connection lifecycle and prevents connection leaks.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: DATABASE_CONFIG.SSL_CONFIG,
  // Connection pool configuration for better performance
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout after 10 seconds when getting connection
});

/**
 * Enhanced database query function with better error handling and logging
 * 
 * @param text - SQL query string with parameterized placeholders
 * @param params - Array of parameters to bind to the query
 * @returns Promise resolving to query result
 * 
 * Features:
 * - Automatic connection management with proper cleanup
 * - Comprehensive error logging for debugging
 * - Type-safe parameter binding to prevent SQL injection
 * - Performance monitoring (query execution time)
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string, 
  params?: unknown[]
): Promise<QueryResult<T>> {
  const startTime = Date.now();
  let client: PoolClient | null = null;
  
  try {
    // Get connection from pool with timeout handling
    client = await pool.connect();
    
    // Log query for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executing query:', text.replace(/\s+/g, ' ').trim());
      if (params && params.length > 0) {
        console.log('Query parameters:', params);
      }
    }
    
    // Execute the parameterized query
    const result = await client.query<T>(text, params);
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      const executionTime = Date.now() - startTime;
      console.log(`Query executed in ${executionTime}ms, returned ${result.rows.length} rows`);
    }
    
    return result;
  } catch (error) {
    // Enhanced error logging with context
    console.error('Database query failed:', {
      query: text.replace(/\s+/g, ' ').trim(),
      params,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
    });
    
    // Re-throw the error for upstream handling
    throw error;
  } finally {
    // Always release the connection back to the pool
    if (client) {
      client.release();
    }
  }
}

/**
 * Supabase-compatible database interface
 * 
 * Provides a familiar API for developers used to Supabase while using
 * direct PostgreSQL connections for better performance and control.
 * All methods include proper error handling and return consistent response format.
 */
export const db = {
  /**
   * Create a table query builder
   * @param table - Name of the database table
   * @returns Object with query methods (select, insert, update, delete)
   */
  from: (table: string) => ({
    /**
     * Select data from the table
     * @param columns - Columns to select (default: all columns)
     * @returns Promise with data and error properties
     */
    select: async (columns = DATABASE_CONFIG.DEFAULT_SELECT_COLUMNS) => {
      try {
        // Validate table name to prevent SQL injection
        if (!isValidTableName(table)) {
          throw new Error(`Invalid table name: ${table}`);
        }
        
        const result = await query(`SELECT ${columns} FROM ${table}`);
        return { data: result.rows, error: null };
      } catch (error) {
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Unknown error occurred' 
        };
      }
    },
    
    /**
     * Insert new record into the table
     * @param data - Object containing column-value pairs to insert
     * @returns Promise with inserted data and error properties
     */
    insert: async (data: Record<string, unknown>) => {
      try {
        // Validate input data
        if (!data || Object.keys(data).length === 0) {
          throw new Error('Insert data cannot be empty');
        }
        
        if (!isValidTableName(table)) {
          throw new Error(`Invalid table name: ${table}`);
        }
        
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const columns = keys.join(', ');
        
        const result = await query(
          `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
          values
        );
        
        return { data: result.rows[0], error: null };
      } catch (error) {
        return { 
          data: null, 
          error: error instanceof Error ? error.message : 'Insert operation failed' 
        };
      }
    },
    
    /**
     * Update records in the table
     * @param data - Object containing column-value pairs to update
     * @returns Object with eq method for specifying WHERE condition
     */
    update: async (data: Record<string, unknown>) => ({
      /**
       * Specify WHERE condition for update
       * @param column - Column name for WHERE condition
       * @param value - Value to match in WHERE condition
       * @returns Promise with updated data and error properties
       */
      eq: async (column: string, value: unknown) => {
        try {
          // Validate input data
          if (!data || Object.keys(data).length === 0) {
            throw new Error('Update data cannot be empty');
          }
          
          if (!isValidTableName(table) || !isValidColumnName(column)) {
            throw new Error('Invalid table or column name');
          }
          
          const keys = Object.keys(data);
          const values = Object.values(data);
          const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
          
          const result = await query(
            `UPDATE ${table} SET ${setClause} WHERE ${column} = $${keys.length + 1} RETURNING *`,
            [...values, value]
          );
          
          return { data: result.rows[0] || null, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Update operation failed' 
          };
        }
      }
    }),
    
    /**
     * Delete records from the table
     * @returns Object with eq method for specifying WHERE condition
     */
    delete: () => ({
      /**
       * Specify WHERE condition for delete
       * @param column - Column name for WHERE condition
       * @param value - Value to match in WHERE condition
       * @returns Promise with null data and error properties
       */
      eq: async (column: string, value: unknown) => {
        try {
          if (!isValidTableName(table) || !isValidColumnName(column)) {
            throw new Error('Invalid table or column name');
          }
          
          await query(`DELETE FROM ${table} WHERE ${column} = $1`, [value]);
          return { data: null, error: null };
        } catch (error) {
          return { 
            data: null, 
            error: error instanceof Error ? error.message : 'Delete operation failed' 
          };
        }
      }
    })
  })
};

/**
 * Utility function to validate table names (basic SQL injection prevention)
 * @param tableName - Table name to validate
 * @returns Boolean indicating if table name is safe to use
 */
function isValidTableName(tableName: string): boolean {
  // Allow only alphanumeric characters and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
}

/**
 * Utility function to validate column names (basic SQL injection prevention)
 * @param columnName - Column name to validate
 * @returns Boolean indicating if column name is safe to use
 */
function isValidColumnName(columnName: string): boolean {
  // Allow only alphanumeric characters and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName);
}

/**
 * Export the connection pool for advanced use cases
 * 
 * Note: Direct pool usage should be avoided in favor of the query() function
 * which provides better error handling and connection management.
 */
export { pool };

/**
 * Enhanced database type definitions with better type safety
 * 
 * These types provide compile-time safety for database operations
 * and help prevent common errors when working with database records.
 */
export interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  error: string | null;
  count?: number;
  page?: number;
  limit?: number;
}

/**
 * Database schema type definitions
 * 
 * These interfaces define the exact structure of database tables
 * and provide type safety for all database operations.
 */
export type Database = {
  public: {
    Tables: {
      polls: {
        Row: {
          id: string;
          question: string;
          options: string[];
          allow_multiple_selections?: boolean;
          max_selections?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          options: string[];
          allow_multiple_selections?: boolean;
          max_selections?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          options?: string[];
          allow_multiple_selections?: boolean;
          max_selections?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          option_index: number;
          voter_ip: string;
          voted_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_index: number;
          voter_ip: string;
          voted_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          option_index?: number;
          voter_ip?: string;
          voted_at?: string;
        };
      };
    };
  };
};

/**
 * Gracefully close all database connections
 * 
 * This function should be called when the application is shutting down
 * to ensure all database connections are properly closed.
 */
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('Database connection pool closed successfully');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
}
