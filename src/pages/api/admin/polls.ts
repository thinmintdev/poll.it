import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL_HERE';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

// For admin actions, we'll use the service_role key (if available) to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Poll validation schema
const pollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  visibility: z.enum(["public", "private"]),
  max_choices: z.number().int().min(1).max(8),
  category_id: z.string().uuid("Invalid category ID"),
  user_id: z.string(),
  choices: z.array(z.string().min(1, "Choice cannot be empty")).min(2, "At least 2 choices required").max(8, "Maximum 8 choices allowed")
});

// Update schema
const updatePollSchema = z.object({
  id: z.string().uuid("Invalid poll ID"),
  question: z.string().min(5).optional(),
  visibility: z.enum(["public", "private"]).optional(),
  max_choices: z.number().int().min(1).max(8).optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
});

// Verify admin token - this is a mock verification for development
function verifyAdminToken(token: string): boolean {
  try {
    // Check if the token has the format of a JWT (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // In development, we don't verify the signature, just check the structure
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
    // Create the appropriate Supabase client based on available keys
    // If we have a service role key, use it for admin operations (bypasses RLS)
    // Otherwise fallback to the anon key
    let supabase;
    
    if (supabaseServiceKey) {
      // Use service role key for admin operations (bypasses RLS)
      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('Using service role key for admin operations');
    } else {
      // Fallback to anon key - for development only
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Service role key not available, using anon key');
    }
    
    // For development: verify our mock admin token
    let isAdmin = false;
    let userId = null;
    
    if (process.env.NODE_ENV !== 'production' && verifyAdminToken(token)) {
      isAdmin = true;
      userId = 'admin-user-001';
    } else {
      // For production: Verify with Supabase's built-in authentication
      try {
        // Verify the JWT token with Supabase
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !userData?.user) {
          console.error('Invalid user token:', userError);
          return res.status(401).json({ message: "Unauthorized - Invalid user token" });
        }
        
        userId = userData.user.id;
        
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
        return getPolls(req, res, supabase);
      case "POST":
        return createPoll(req, res, supabase);
      case "PUT":
        return updatePoll(req, res, supabase);
      case "DELETE":
        return deletePoll(req, res, supabase);
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getPolls(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Query the polls table
    const { data: pollsData, error: pollsError } = await supabase
      .from("polls")
      .select(`
        id, 
        question,
        visibility,
        max_choices,
        user_id,
        category_id,
        created_at,
        updated_at,
        categories:category_id (name),
        choices (id, text)
      `)
      .order('created_at', { ascending: false });
    
    if (pollsError) {
      console.error('Error fetching polls:', pollsError);
      
      // If polls table doesn't exist, try poll table (singular)
      if (pollsError.code === "42P01") {
        const { data: singularData, error: singularError } = await supabase
          .from("poll")
          .select(`
            id, 
            question,
            visibility,
            max_choices,
            user_id,
            category_id,
            created_at,
            updated_at,
            categories:category_id (name),
            choices (id, text)
          `)
          .order('created_at', { ascending: false });
          
        if (singularError) {
          console.error('Error fetching from poll table:', singularError);
          throw singularError;
        }
        
        return res.status(200).json({ polls: singularData || [] });
      }
      
      throw pollsError;
    }
    
    // Format the response to match the expected shape in our frontend
    const formattedPolls = pollsData.map(poll => ({
      ...poll,
      category_name: poll.categories?.name || 'Uncategorized',
      choices_count: (poll.choices || []).length
    }));
    
    return res.status(200).json({ polls: formattedPolls || [] });
  } catch (error: any) {
    console.error('Error fetching polls:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while fetching polls' });
  }
}

async function createPoll(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate input using Zod
    const parseResult = pollSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid poll data", 
        errors: parseResult.error.format() 
      });
    }
    
    const { question, visibility, max_choices, category_id, user_id, choices } = parseResult.data;
    
    // Start a transaction by using supabase
    // First create the poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question,
        visibility,
        max_choices,
        category_id,
        user_id
      })
      .select("id")
      .single();
    
    if (pollError) {
      console.error('Error creating poll:', pollError);
      
      // Check if it's an RLS policy error
      if (pollError.message && pollError.message.includes('policy')) {
        return res.status(403).json({ 
          message: "Row-level security policy prevented poll creation. Administrator access required.",
          details: pollError.message
        });
      }
      
      throw pollError;
    }
    
    // Now create the choices for this poll
    const choiceRows = choices.map(text => ({
      poll_id: poll.id,
      text
    }));
    
    const { error: choicesError } = await supabase
      .from("choices")
      .insert(choiceRows);
    
    if (choicesError) {
      console.error('Error creating poll choices:', choicesError);
      throw choicesError;
    }
    
    return res.status(201).json({ 
      message: "Poll created successfully",
      pollId: poll.id 
    });
  } catch (error: any) {
    console.error('Error creating poll:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while creating poll' });
  }
}

async function updatePoll(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate input
    const parseResult = updatePollSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid poll data", 
        errors: parseResult.error.format() 
      });
    }
    
    const { id, ...updateData } = parseResult.data;
    
    // Check if poll exists
    const { data: existingPoll, error: checkError } = await supabase
      .from("polls")
      .select("id")
      .eq("id", id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: "Poll not found" });
      }
      throw checkError;
    }
    
    // Update the poll
    const { error: updateError } = await supabase
      .from("polls")
      .update(updateData)
      .eq("id", id);
    
    if (updateError) {
      console.error('Error updating poll:', updateError);
      
      // Check if it's an RLS policy error
      if (updateError.message && updateError.message.includes('policy')) {
        return res.status(403).json({ 
          message: "Row-level security policy prevented poll update. Administrator access required.",
          details: updateError.message
        });
      }
      
      throw updateError;
    }
    
    return res.status(200).json({ message: "Poll updated successfully" });
  } catch (error: any) {
    console.error('Error updating poll:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while updating poll' });
  }
}

async function deletePoll(req: NextApiRequest, res: NextApiResponse, supabase: any) {
  try {
    // Validate ID
    const idSchema = z.object({ id: z.string().uuid("Invalid poll ID") });
    const parseResult = idSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        message: "Invalid poll ID", 
        errors: parseResult.error.format() 
      });
    }
    
    const { id } = parseResult.data;
    
    // Check if poll exists
    const { data: existingPoll, error: checkError } = await supabase
      .from("polls")
      .select("id")
      .eq("id", id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') { // Not found
        return res.status(404).json({ message: "Poll not found" });
      }
      throw checkError;
    }
    
    // First delete the choices (we need to do this first due to foreign key constraints)
    const { error: choicesDeleteError } = await supabase
      .from("choices")
      .delete()
      .eq("poll_id", id);
    
    if (choicesDeleteError) {
      console.error('Error deleting poll choices:', choicesDeleteError);
      throw choicesDeleteError;
    }
    
    // Now delete the poll
    const { error: pollDeleteError } = await supabase
      .from("polls")
      .delete()
      .eq("id", id);
    
    if (pollDeleteError) {
      console.error('Error deleting poll:', pollDeleteError);
      
      // Check if it's an RLS policy error
      if (pollDeleteError.message && pollDeleteError.message.includes('policy')) {
        return res.status(403).json({ 
          message: "Row-level security policy prevented poll deletion. Administrator access required.",
          details: pollDeleteError.message
        });
      }
      
      throw pollDeleteError;
    }
    
    return res.status(200).json({ message: "Poll deleted successfully" });
  } catch (error: any) {
    console.error('Error deleting poll:', error);
    return res.status(500).json({ message: error.message || 'Internal server error while deleting poll' });
  }
}
