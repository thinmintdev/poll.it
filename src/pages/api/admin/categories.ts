import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';
import { categorySchema } from '@/schemas/admin';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';
// Service role key - should only be used server-side for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verify admin token - this is a mock verification for development
function verifyAdminToken(token: string): boolean {
  try {
    // Check if the token has the format of a JWT (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // In development, we don't verify the signature, just check the structure
    // In production, you would cryptographically verify the JWT signature
    const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    // Check if this is our admin user
    if (payload.isAdmin === true && payload.sub === 'admin-user-001') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - Missing or invalid Authorization header" });
  }
  
  const token = authHeader.replace("Bearer ", "");
  
  try {
    // Create a Supabase client using service role key if available (to bypass RLS)
    const supabase = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, supabaseAnonKey);
    
    // For development: verify our mock admin token
    let isAdmin = false;
    if (process.env.NODE_ENV !== 'production' && verifyAdminToken(token)) {
      isAdmin = true;
    } else {
      // For production: Verify with Supabase's built-in authentication
      try {
        // Verify the JWT token with Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !userData?.user) {
          console.error('Invalid user token:', userError);
          return res.status(401).json({ message: "Unauthorized - Invalid user token" });
        }
        
        // Check if the user has admin privileges in the profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", userData.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching admin status:', profileError);
          return res.status(500).json({ message: "Internal server error during authentication" });
        }
        
        isAdmin = !!profile?.is_admin;
      } catch (authError) {
        console.error('Authentication error:', authError);
        return res.status(500).json({ message: "Internal server error during authentication" });
      }
    }
    
    if (!isAdmin) {
      return res.status(403).json({ message: "Forbidden - Admin privileges required" });
    }

    // Handle CRUD operations based on HTTP method
    switch (req.method) {
      case "GET":
        return getCategories(req, res, supabase);
      case "POST":
        return createCategory(req, res, supabase);
      case "PUT":
        return updateCategory(req, res, supabase);
      case "DELETE":
        return deleteCategory(req, res, supabase);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getCategories(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Query the categories table - try categories first, then fall back to category if needed
    let result;
    
    // Try "categories" table first
    result = await supabase
      .from("categories")
      .select("id, name")
      .order("name");
    
    // If there's an error with "categories", try "category" table
    if (result.error && result.error.code === "42P01") { // table doesn't exist
      console.log('Trying alternative table name: "category"');
      result = await supabase
        .from("category")
        .select("id, name")
        .order("name");
    }
    
    if (result.error) {
      console.error('Error fetching categories:', result.error);
      throw result.error;
    }
    
    return res.status(200).json({ categories: result.data || [] });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while fetching categories' });
  }
}

async function createCategory(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate input using Zod
    const parseResult = categorySchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid category data", 
        errors: parseResult.error.format() 
      });
    }
    
    const { name } = parseResult.data;
    
    // Determine which table to use
    let tableName = "categories";
    
    // Test if categories table exists
    const testResult = await supabase
      .from(tableName)
      .select("id")
      .limit(1);
    
    // If table doesn't exist, try category
    if (testResult.error && testResult.error.code === "42P01") {
      tableName = "category";
    }
    
    // Check if category with same name already exists (case insensitive)
    const { data: existingCategory, error: checkError } = await supabase
      .from(tableName)
      .select("id")
      .ilike("name", name)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    if (existingCategory) {
      return res.status(409).json({ message: "A category with this name already exists." });
    }
    
    // Insert into the appropriate categories table
    const { data, error } = await supabase
      .from(tableName)
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(201).json({ category: data });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while creating category' });
  }
}

async function updateCategory(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate category name
    const parseResult = categorySchema.safeParse({ name: req.body.name });
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid category data", 
        errors: parseResult.error.format() 
      });
    }
    
    // Validate ID separately
    const idSchema = z.object({ id: z.string().uuid("Invalid category ID") });
    const idParseResult = idSchema.safeParse({ id: req.body.id });
    
    if (!idParseResult.success) {
      return res.status(400).json({ 
        message: "Invalid category ID", 
        errors: idParseResult.error.format() 
      });
    }
    
    const { id } = idParseResult.data;
    const { name } = parseResult.data;
    
    // Determine which table to use
    let tableName = "categories";
    
    // Test if categories table exists
    const testResult = await supabase
      .from(tableName)
      .select("id")
      .limit(1);
    
    // If table doesn't exist, try category
    if (testResult.error && testResult.error.code === "42P01") {
      tableName = "category";
    }
    
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from(tableName)
      .select("id")
      .eq("id", id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError;
    }
    
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    
    // Check if another category with the same name exists
    const { data: nameExists, error: nameCheckError } = await supabase
      .from(tableName)
      .select("id")
      .ilike("name", name)
      .neq("id", id)
      .maybeSingle();
    
    if (nameCheckError) throw nameCheckError;
    
    if (nameExists) {
      return res.status(409).json({ message: "Another category with this name already exists." });
    }
    
    // Update the category table
    const { data, error } = await supabase
      .from(tableName)
      .update({ name })
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json({ category: data });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while updating category' });
  }
}

async function deleteCategory(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate ID
    const idSchema = z.object({ id: z.string().uuid("Invalid category ID") });
    const parseResult = idSchema.safeParse({ id: req.body.id });
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid category ID", 
        errors: parseResult.error.format() 
      });
    }
    
    const { id } = parseResult.data;
    
    // Determine which table to use
    let tableName = "categories";
    
    // Test if categories table exists
    const testResult = await supabase
      .from(tableName)
      .select("id")
      .limit(1);
    
    // If table doesn't exist, try category
    if (testResult.error && testResult.error.code === "42P01") {
      tableName = "category";
    }
    
    // Check if the category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from(tableName)
      .select("id")
      .eq("id", id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError;
    }
    
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found." });
    }
    
    // Check if the category is used in any polls
    const { data: pollsWithCategory, error: pollsError } = await supabase
      .from("polls")
      .select("id")
      .eq("category_id", id)
      .limit(1);
    
    if (pollsError) {
      // Try with singular 'poll' table if 'polls' doesn't exist
      if (pollsError.code === "42P01") {
        const { data: pollsAlt, error: pollsAltError } = await supabase
          .from("poll")
          .select("id")
          .eq("category_id", id)
          .limit(1);
          
        if (pollsAltError) throw pollsAltError;
        
        if (pollsAlt && pollsAlt.length > 0) {
          return res.status(409).json({ 
            message: "Cannot delete category that is in use by polls. Reassign the polls first." 
          });
        }
      } else {
        throw pollsError;
      }
    } else if (pollsWithCategory && pollsWithCategory.length > 0) {
      return res.status(409).json({ 
        message: "Cannot delete category that is in use by polls. Reassign the polls first." 
      });
    }
    
    // Delete the category
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq("id", id);
    
    if (deleteError) throw deleteError;
    
    return res.status(200).json({ message: "Category deleted successfully." });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while deleting category' });
  }
}