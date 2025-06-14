import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

  // Auth
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { question, choices, visibility, category_id } = req.body;
  if (!question || !choices || !Array.isArray(choices) || choices.length < 2 || !category_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Get user
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) return res.status(401).json({ message: "Unauthorized" });

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
      user_id: userData.user.id,
      password,
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