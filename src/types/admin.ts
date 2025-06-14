export type AdminSession = {
  id: string;
  username?: string; // Adding username property
  isAdmin: boolean;
  access_token: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Poll = {
  id: string;
  question: string;
  visibility: 'public' | 'private' | 'unlisted'; // Added 'unlisted' as a common option
  max_choices: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  user_id: string;
  categories?: { name: string }; // For joined data
  profiles?: { username: string }; // For joined data
  password_hash?: string | null; // From schema, might not always be fetched/set
  duration_minutes?: number | null; // From schema
  expires_at?: string | null; // From schema (timestamp)
  // 'password' field is for input, not typically part of the Poll model itself after hashing
};

export type User = {
  id: string; // Corresponds to profiles.id and auth.users.id
  email: string; // From auth.users, but often in profiles too for convenience
  username: string; // From profiles
  display_name?: string | null; // From profiles
  avatar_url?: string | null; // From profiles
  bio?: string | null; // From profiles
  is_admin: boolean; // From profiles.is_admin
  banned: boolean; // From profiles.banned
  // removed deleted: boolean; as it's not in the schema
  created_at: string; // From profiles
  updated_at?: string; // From profiles
};

export type AdminProfile = { // This should align closely with the 'profiles' table
  id: string; // This is the user_id, typically auth.users.id
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  email: string; // Usually from auth.users, but can be denormalized
  is_admin: boolean;
  banned: boolean; // Added, as admins can also be banned/restricted
  created_at: string;
  updated_at: string;
};
