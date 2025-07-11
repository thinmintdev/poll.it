import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Rate limiting for anonymous users
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_ANONYMOUS_POLLS_PER_HOUR = 5;

const getClientIP = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return ip || 'unknown';
};

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now - userLimit.lastReset > RATE_LIMIT_WINDOW) {
    // Reset or create new limit
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }
  
  if (userLimit.count >= MAX_ANONYMOUS_POLLS_PER_HOUR) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// Helper to generate random password
const generatePassword = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Auth (optional for anonymous users)
  const authHeader = req.headers.authorization;
  let supabase;
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Get user if authenticated
    const { data: userData } = await supabase.auth.getUser(token);
    if (userData?.user) {
      userId = userData.user.id;
    }
  } else {
    // Anonymous user - check rate limit
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    const clientIP = getClientIP(req);
    
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        message: `Rate limit exceeded. Anonymous users can create up to ${MAX_ANONYMOUS_POLLS_PER_HOUR} polls per hour.` 
      });
    }
  }

  const { question, choices, visibility, category_id, allow_multiple } = req.body;
  if (!question || !choices || !Array.isArray(choices) || choices.length < 2 || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Generate password for private polls
  let password: string | null = null;
  if (visibility === "private") {
    password = generatePassword(8);
  }

  // Insert poll
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      question,
      visibility,
      category_id,
      user_id: userId,
      password,
      allow_multiple: allow_multiple || false,
    })
    .select()
    .single();

  if (pollError) {
    return res.status(500).json({ message: "Failed to create poll", error: pollError.message });
  }

  // Insert choices
  const choicesData = choices.map((text: string, idx: number) => ({
    poll_id: poll.id,
    text,
    order: idx,
  }));
  const { error: choicesError } = await supabase.from("choices").insert(choicesData);
  if (choicesError) {
    return res.status(500).json({ message: "Failed to create choices", error: choicesError.message });
  }

  // Return password only for private polls
  return res.status(200).json({ message: "Poll created", pollId: poll.id, password });
} 