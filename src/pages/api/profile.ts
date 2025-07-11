import type { NextApiRequest, NextApiResponse } from "next";
import { createAuthClient } from '../../utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");

  // Create a Supabase client with the user's JWT for RLS
  const supabase = createAuthClient(token);

  // Get user
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData?.user) return res.status(401).json({ message: "Unauthorized" });
  const userId = userData.user.id;

  if (req.method === "GET") {
    // Pagination and search
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "15", 10);
    const search = (req.query.search as string) || "";
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch own profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, bio, is_admin, banned, created_at")
      .eq("id", userId)
      .single();
    if (profileError) return res.status(500).json({ message: profileError.message });

    // Build poll query (join categories)
    let pollQuery = supabase
      .from("polls")
      .select("id, question, created_at, category_id, visibility, categories(name)", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (search) {
      pollQuery = pollQuery.ilike("question", `%${search}%`);
    }
    // Get paginated polls
    const { data: polls, error: pollsError, count: total } = await pollQuery.range(from, to);
    if (pollsError) return res.status(500).json({ message: pollsError.message });

    return res.status(200).json({ profile, polls, total: total || 0 });
  }

  if (req.method === "PUT") {
    // Update profile (username, display_name, avatar, bio)
    const { username, display_name, avatar_url, bio } = req.body;
    const { data, error } = await supabase
      .from("profiles")
      .update({ username, display_name, avatar_url, bio })
      .eq("id", userId)
      .select()
      .single();
    if (error) return res.status(500).json({ message: error.message });
    return res.status(200).json(data);
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 