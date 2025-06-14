import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "../utils/supabaseClient";

const POLLS_PER_PAGE = 15;

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({ display_name: "", username: "", bio: "", avatar_url: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch profile and polls
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      // Fetch profile and polls from API
      const params = new URLSearchParams({
        page: String(page),
        limit: String(POLLS_PER_PAGE),
      });
      if (search) params.append("search", search);
      const res = await fetch(`/api/profile?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        setError("Failed to fetch profile");
        setProfile(null);
        setPolls([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      const { profile, polls, total } = await res.json();
      setProfile(profile);
      setPolls(polls);
      setTotal(total);
      setEditForm({
        display_name: profile.display_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
      setLoading(false);
    };
    fetchProfile();
  }, [router, page, search]);

  // Update profile
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    setSuccess("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Not logged in");
      setEditLoading(false);
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(editForm),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to update profile");
    } else {
      setSuccess("Profile updated!");
      // Refetch profile
      const { profile } = await res.json();
      setProfile(profile);
    }
    setEditLoading(false);
  };

  // Avatar upload
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setAvatarUploading(true);
    setError("");
    setSuccess("");
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${profile.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (error) {
      setError("Failed to upload avatar");
      setAvatarUploading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    setEditForm(f => ({ ...f, avatar_url: publicUrlData.publicUrl }));
    setAvatarUploading(false);
    setSuccess("Avatar uploaded! Click Save Changes to update profile.");
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // Pagination
  const totalPages = Math.ceil(total / POLLS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto pt-10">
      <h2 className="text-2xl font-bold mb-6 text-foreground">My Profile</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : profile ? (
        <>
          <form onSubmit={handleEdit} className="bg-card dark:bg-poll-darker rounded shadow p-6 mb-8 border border-border">
            <div className="flex items-center gap-6 mb-4">
              <div
                className="w-20 h-20 rounded-full border flex items-center justify-center bg-muted cursor-pointer relative overflow-hidden"
                onClick={handleAvatarClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAvatarClick();
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Click to upload avatar"
                title="Click to upload"
              >
                {editForm.avatar_url ? (
                  <Image
                    src={editForm.avatar_url}
                    alt="User avatar"
                    className="object-cover w-full h-full"
                    width={80}
                    height={80}
                  />
                ) : (
                  <Image
                    src="/default-avatar.png"
                    alt="Default avatar"
                    className="object-cover w-full h-full"
                    width={80}
                    height={80}
                  />
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-blue-600 font-bold">Uploading...</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                  id="avatar-upload"
                  aria-label="Upload avatar image"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="avatar-url" className="block font-medium mb-1">Avatar URL</label>
                <input
                  type="text"
                  id="avatar-url"
                  className="border rounded p-2 w-full"
                  value={editForm.avatar_url || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, avatar_url: e.target.value }))}
                  placeholder="https://..."
                  aria-describedby="avatar-url-help"
                />
                <small id="avatar-url-help" className="text-gray-500">Enter a URL or click the avatar to upload a file</small>
              </div>
            </div>
            <label htmlFor="display-name" className="block font-medium mb-1">Display Name</label>
            <input
              type="text"
              id="display-name"
              className="border rounded p-2 w-full mb-4"
              value={editForm.display_name}
              onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
              required
              aria-required="true"
            />
            <label htmlFor="username" className="block font-medium mb-1">Username</label>
            <input
              type="text"
              id="username"
              className="border rounded p-2 w-full mb-4"
              value={editForm.username}
              onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
              required
              aria-required="true"
            />
            <label htmlFor="bio" className="block font-medium mb-1">Bio</label>
            <textarea
              id="bio"
              className="border rounded p-2 w-full mb-4"
              value={editForm.bio || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="A short bio about you..."
            />
            <label htmlFor="email" className="block font-medium mb-1">Email</label>
            <input
              type="text"
              id="email"
              className="border rounded p-2 w-full mb-4 bg-gray-100 cursor-not-allowed"
              value={profile.email || "(hidden)"}
              disabled
              aria-readonly="true"
            />
            <div className="flex gap-4 items-center mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                disabled={editLoading}
                aria-busy={editLoading}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
          <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h3 className="text-xl font-semibold">My Polls</h3>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="text"
                  id="poll-search"
                  className="border rounded p-2"
                  placeholder="Search polls..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Search polls"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded font-semibold"
                  aria-label="Search polls"
                >Search</button>
              </form>
            </div>
            {polls.length === 0 ? (
              <div className="text-gray-500">You haven't created any polls yet.</div>
            ) : (
              <ul className="divide-y">
                {polls.map((poll) => (
                  <li key={poll.id} className="py-3">
                    <Link href={`/poll/${poll.id}`} className="font-medium text-blue-700 hover:underline focus:outline-none focus:underline">
                      {poll.question}
                    </Link>
                    <div className="text-gray-500 text-sm">
                      {new Date(poll.created_at).toLocaleString()} |
                      Category: {poll.categories?.name || "-"} |
                      Visibility: {poll.visibility}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`px-3 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setPage(p)}
                    disabled={p === page}
                    aria-label={`Go to page ${p}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ProfilePage;