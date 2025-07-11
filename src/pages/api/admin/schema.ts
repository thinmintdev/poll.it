import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Get information about available tables
    const { data: tables, error: tablesError } = await supabase.rpc('list_tables');
    
    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      // If RPC doesn't work, try a different approach - query system tables
      const { data: altTables, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public');
      
      if (altError) {
        console.error('Error with alternative table query:', altError);
        return res.status(500).json({ 
          message: 'Failed to get schema information',
          error: altError
        });
      }
      
      // Find the profiles table - if it exists, query its columns
      let profilesTable = altTables?.find(t => t.table_name.toLowerCase() === 'profiles' || t.table_name.toLowerCase() === 'profile');
      let categoriesTable = altTables?.find(t => 
        t.table_name.toLowerCase() === 'categories' || 
        t.table_name.toLowerCase() === 'category' || 
        t.table_name.toLowerCase() === 'poll_categories'
      );
      
      // Get columns for profiles
      let profileColumns = null;
      let categoryColumns = null;
      
      if (profilesTable) {
        const { data: columns, error: colError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_schema', 'public')
          .eq('table_name', profilesTable.table_name);
          
        if (!colError) {
          profileColumns = columns;
        }
      }
      
      // Get columns for categories
      if (categoriesTable) {
        const { data: columns, error: colError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type')
          .eq('table_schema', 'public')
          .eq('table_name', categoriesTable.table_name);
          
        if (!colError) {
          categoryColumns = columns;
        }
      }
      
      return res.status(200).json({
        message: 'Schema information (alternative method)',
        tables: altTables || [],
        profilesTable,
        profileColumns,
        categoriesTable,
        categoryColumns
      });
    }
    
    // List tables
    return res.status(200).json({
      message: 'Schema information',
      tables: tables || []
    });
  } catch (error) {
    console.error('Schema inspection error:', error);
    return res.status(500).json({ 
      message: 'Error inspecting schema',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
