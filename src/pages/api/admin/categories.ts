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
    // List all categories
    const { data, error } = await supabase.from("categories").select("id, name").order("name");
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    // Add a new category
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required." });
    }
    const { data, error } = await supabase.from("categories").insert([{ name }]).select().single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json(data);
  }

  if (req.method === "PUT") {
    // Edit a category
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ message: "Category id and name are required." });
    }
    const { data, error } = await supabase.from("categories").update({ name }).eq("id", id).select().single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    // Delete a category
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Category id is required." });
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return res.status(500).json({ message: error.message });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 