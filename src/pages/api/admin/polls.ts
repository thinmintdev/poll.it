import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ktsvgjezhyrzrhghilvm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0c3ZnamV6aHlyenJoZ2hpbHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2ODkwMjcsImV4cCI6MjA2NTI2NTAyN30.ragywUSW8m1l7y3HPIMGtf54reMP2Bak99M4FETG9sw';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");

  // Create a Supabase client with the user's JWT for RLS
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  // Check admin
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) return res.status(401).json({ message: "Unauthorized" });
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .single();
  if (!profile?.is_admin) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    // List all polls (with creator and category info)
    const { data, error } = await supabase
      .from("polls")
      .select(`id, question, visibility, max_choices, created_at, updated_at, category_id, user_id, categories(name), profiles(username)`)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json({ polls: data ?? [], total: data?.length ?? 0 });
  }

  if (req.method === "DELETE") {
    // Delete a poll
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Poll id is required." });
    }
    const { error } = await supabase.from("polls").delete().eq("id", id);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(204).end();
  }

  if (req.method === "PUT") {
    // Edit a poll
    const { id, question, visibility, max_choices, category_id } = req.body;
    if (!id || !question || !visibility || !category_id) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const { data, error } = await supabase
      .from("polls")
      .update({ question, visibility, max_choices, category_id })
      .eq("id", id)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    // Add a new poll (admin only, for completeness)
    const { question, visibility, max_choices, category_id, user_id, choices } = req.body;
    if (!question || !visibility || !category_id || !user_id || !Array.isArray(choices) || choices.length < 2) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert([{ question, visibility, max_choices, category_id, user_id }])
      .select()
      .single();
    if (pollError) return res.status(500).json({ message: pollError.message });
    // Insert choices
    const choicesData = choices.map((text: string, idx: number) => ({ poll_id: poll.id, text, order: idx }));
    const { data: insertedChoices, error: choicesError } = await supabase.from("choices").insert(choicesData).select();
    if (choicesError) return res.status(500).json({ message: choicesError.message });
    return res.status(201).json({ poll, choices: insertedChoices });
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}