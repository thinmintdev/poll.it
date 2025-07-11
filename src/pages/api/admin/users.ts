import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';
import { userUpdateSchema } from '@/schemas/admin';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

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
    // Create a Supabase client without the user token
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
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
        return getUsers(req, res, supabase);
      case "PUT":
      case "PATCH":
        return updateUser(req, res, supabase);
      case "DELETE":
        return deleteUser(req, res, supabase);
      default:
        res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getUsers(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const includeAdmins = req.query.includeAdmins === 'true';
    
    // Start building the query
    let query = supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, is_admin, banned, created_at, updated_at", { count: 'exact' });
    
    // Apply filters
    if (!includeAdmins) {
      query = query.eq("is_admin", false);
    }
    
    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to).order("created_at", { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return res.status(200).json({ 
      users: data || [], 
      total: count || 0 
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while fetching users' });
  }
}

async function updateUser(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate input using Zod
    const parseResult = userUpdateSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid user data", 
        errors: parseResult.error.format() 
      });
    }
    
    const { id, ...updates } = parseResult.data;
    
    // Check if the user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: "User not found." });
      }
      throw checkError;
    }
    
    // Check username uniqueness if it's being updated
    if (updates.username) {
      const { data: existingUsername, error: usernameError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", updates.username)
        .neq("id", id)
        .single();
      
      if (usernameError && usernameError.code !== 'PGRST116') { // PGRST116 is "not found" which is what we want
        throw usernameError;
      }
      
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken." });
      }
    }
    
    // Build update object with only defined fields
    const updateData: Record<string, any> = {};
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.display_name !== undefined) updateData.display_name = updates.display_name;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.is_admin !== undefined) updateData.is_admin = updates.is_admin;
    if (updates.banned !== undefined) updateData.banned = updates.banned;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid update fields provided." });
    }
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update the profile
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    
    return res.status(200).json({ user: data });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while updating user' });
  }
}

async function deleteUser(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate ID
    const idSchema = z.object({ id: z.string().uuid("Invalid user ID") });
    const parseResult = idSchema.safeParse({ id: req.body.id });
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid user ID", 
        errors: parseResult.error.format() 
      });
    }
    
    const { id } = parseResult.data;
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id, is_admin")
      .eq("id", id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: "User not found." });
      }
      throw checkError;
    }
    
    // Prevent deleting the last admin
    if (existingUser.is_admin) {
      const { data: adminCount, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: 'exact' })
        .eq("is_admin", true);
      
      if (countError) throw countError;
      
      if (adminCount && adminCount.length <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin user." });
      }
    }
    
    // Check if user has created polls that would be orphaned
    const { data: userPolls, error: pollsError } = await supabase
      .from("poll")
      .select("id")
      .eq("user_id", id);
    
    if (pollsError) throw pollsError;
    
    if (userPolls && userPolls.length > 0) {
      // In a real app, you might either:
      // 1. Transfer ownership of polls to another user
      // 2. Delete the polls (cascading delete)
      // 3. Soft delete the user instead
      
      // For now, we'll prevent deletion if the user has polls
      return res.status(400).json({ 
        message: "Cannot delete user because they have created polls. Consider banning the user instead." 
      });
    }
    
    // Delete from profiles table
    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);
    
    if (deleteError) throw deleteError;
    
    // In a production app, you would also need to delete the user from auth.users
    // This typically requires admin privileges in Supabase
    // const { error: authDeleteError } = await supabase.rpc('delete_user', { user_id: id });
    // if (authDeleteError) throw authDeleteError;
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while deleting user' });
  }
}