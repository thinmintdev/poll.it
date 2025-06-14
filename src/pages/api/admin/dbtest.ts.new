import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktsvgjezhyrzrhghilvm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Create a Supabase client without any user token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to list all tables in the schema
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (tablesError) {
      return res.status(500).json({ 
        message: 'Error fetching tables', 
        error: tablesError 
      });
    }
    
    // Get a list of table names
    const tables = tablesData.map(t => t.table_name);
    
    // Try to query each potential profiles table
    let profilesData = null;
    let profilesError = null;
    let profilesColumns = null;
    
    if (tables.includes('profiles')) {
      // Query profiles table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles');
        
      profilesColumns = columns;
      profilesError = error;
      
      // Try to get first few rows
      const { data, error: dataError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3);
        
      profilesData = data;
      if (dataError) profilesError = dataError;
    }
    
    // Try to query each potential category table
    let categoryData = null;
    let categoryError = null;
    let categoryColumns = null;
    
    // Try "categories" first
    if (tables.includes('categories')) {
      // Query categories table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'categories');
        
      categoryColumns = columns;
      categoryError = error;
      
      // Try to get first few rows
      const { data, error: dataError } = await supabase
        .from('categories')
        .select('*')
        .limit(3);
        
      categoryData = data;
      if (dataError) categoryError = dataError;
    }
    // If no "categories" table, try "category"
    else if (tables.includes('category')) {
      // Query category table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'category');
        
      categoryColumns = columns;
      categoryError = error;
      
      // Try to get first few rows
      const { data, error: dataError } = await supabase
        .from('category')
        .select('*')
        .limit(3);
        
      categoryData = data;
      if (dataError) categoryError = dataError;
    }
    
    // Check for polls and choices tables
    let pollsData = null;
    let pollsError = null;
    let pollsColumns = null;
    let choicesData = null;
    let choicesError = null;
    let choicesColumns = null;
    
    // Check polls table
    if (tables.includes('polls')) {
      // Query polls table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'polls');
        
      pollsColumns = columns;
      pollsError = error;
      
      // Try to get first few rows
      const { data, error: dataError } = await supabase
        .from('polls')
        .select('*')
        .limit(3);
        
      pollsData = data;
      if (dataError) pollsError = dataError;
    }
    
    // Check choices table
    if (tables.includes('choices')) {
      // Query choices table structure
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'choices');
        
      choicesColumns = columns;
      choicesError = error;
      
      // Try to get first few rows
      const { data, error: dataError } = await supabase
        .from('choices')
        .select('*')
        .limit(3);
        
      choicesData = data;
      if (dataError) choicesError = dataError;
    }
    
    return res.status(200).json({
      message: 'Database inspection results',
      tables,
      profiles: {
        exists: tables.includes('profiles'),
        columns: profilesColumns,
        error: profilesError,
        sampleData: profilesData
      },
      category: {
        existsAsCategories: tables.includes('categories'),
        existsAsCategory: tables.includes('category'),
        columns: categoryColumns,
        error: categoryError,
        sampleData: categoryData
      },
      polls: {
        exists: tables.includes('polls'),
        columns: pollsColumns,
        error: pollsError,
        sampleData: pollsData
      },
      choices: {
        exists: tables.includes('choices'),
        columns: choicesColumns,
        error: choicesError,
        sampleData: choicesData
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      message: 'Internal server error during database inspection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
