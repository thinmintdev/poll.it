import React, { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../../utils/supabaseClient";
import {
  Squares2X2Icon,
  UserGroupIcon,
  TagIcon,
  UserCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";

const SIDEBAR_ITEMS = [
  { label: "Polls", icon: <Squares2X2Icon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Users", icon: <UserGroupIcon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Categories", icon: <TagIcon className="w-6 h-6" aria-hidden="true" /> },
  { label: "Profile", icon: <UserCircleIcon className="w-6 h-6" aria-hidden="true" /> },
] as const;
type SidebarSection = (typeof SIDEBAR_ITEMS)[number]["label"];

const POLL_TABS = ["All Polls", "Add Poll", "Edit Polls"];
const USER_TABS = ["All Users", "Admins"];
const CATEGORY_TABS = ["All Categories", "Add Category", "Edit Categories"];

type Category = { id: string; name: string };

const CategoryTabs: React.FC<{ session: any }> = ({ session }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For Add
  const [newCategory, setNewCategory] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // For Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setError("Failed to fetch categories");
      setCategories([]);
    } else {
      setCategories(await res.json());
    }
    setLoading(false);
  }, [session?.access_token]);

  useEffect(() => { 
    if (session?.access_token) {
      fetchCategories(); 
    }
  }, [fetchCategories, session?.access_token]);

  // Add category
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to add category");
    } else {
      setSuccess("Category added!");
      setNewCategory("");
      fetchCategories();
    }
    setAddLoading(false);
  };

  // Edit category
  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setEditName(cat.name);
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: editId, name: editName }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to edit category");
    } else {
      setSuccess("Category updated!");
      cancelEdit();
      fetchCategories();
    }
    setEditLoading(false);
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to delete category");
    } else {
      setSuccess("Category deleted!");
      fetchCategories();
    }
  };

  // Tabs
  const [tab, setTab] = useState(0);
  const tabs = ["All Categories", "Add Category", "Edit Categories"];

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b bg-card dark:bg-poll-darker rounded-t-lg p-4">
        {tabs.map((t, idx) => (
          <button
            key={t}
            className={`pb-2 px-4 font-medium border-b-2 transition-colors ${tab === idx ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}
            onClick={() => setTab(idx)}
          >
            {t}
          </button>
        ))}
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {/* All Categories */}
      {tab === 0 && (
        <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t">
                    <td className="py-2">{cat.name}</td>
                    <td className="py-2">
                      <button className="text-blue-600 mr-4" onClick={() => startEdit(cat)}><PencilSquareIcon className="w-5 h-5 inline mr-1" /> Edit</button>
                      <button className="text-red-600" onClick={() => handleDelete(cat.id)}><TrashIcon className="w-5 h-5 inline mr-1" /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Add Category */}
      {tab === 1 && (
        <form onSubmit={handleAdd} className="bg-card dark:bg-poll-darker rounded shadow p-6 max-w-md border border-border">
          <label htmlFor="category-name" className="block mb-2 font-medium">Category Name</label>
          <input
            id="category-name"
            type="text"
            className="border rounded p-2 w-full mb-4"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            disabled={addLoading}
          ><PlusIcon className="w-5 h-5 inline mr-1" /> {addLoading ? "Adding..." : "Add Category"}</button>
        </form>
      )}
      {/* Edit Categories */}
      {tab === 2 && (
        <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-t">
                    <td className="py-2">
                      {editId === cat.id ? (
                        <form onSubmit={handleEdit} className="flex gap-2">
                          <input
                            type="text"
                            className="border rounded p-2"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            required
                          />
                          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={editLoading}><CheckIcon className="w-5 h-5 inline mr-1" /> Save</button>
                          <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={cancelEdit}><XMarkIcon className="w-5 h-5 inline mr-1" /> Cancel</button>
                        </form>
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="py-2">
                      {editId !== cat.id && (
                        <>
                          <button className="text-blue-600 mr-4" onClick={() => startEdit(cat)}><PencilSquareIcon className="w-5 h-5 inline mr-1" /> Edit</button>
                          <button className="text-red-600" onClick={() => handleDelete(cat.id)}><TrashIcon className="w-5 h-5 inline mr-1" /> Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

type Poll = {
  id: string;
  question: string;
  visibility: string;
  max_choices: number;
  created_at: string;
  updated_at: string;
  category_id: string;
  user_id: string;
  categories?: { name: string };
  profiles?: { username: string };
};

const PollTabs: React.FC<{ session: any }> = ({ session }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For Add
  const [addForm, setAddForm] = useState({
    question: "",
    visibility: "public",
    max_choices: 1,
    category_id: "",
    user_id: "",
    choices: ["", ""],
  });
  const MIN_CHOICES = 2;
  const [addLoading, setAddLoading] = useState(false);

  // For Edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    visibility: "public",
    max_choices: 1,
    category_id: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // For categories and users
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);

  // Fetch polls
  const fetchPolls = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/polls", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setError("Failed to fetch polls");
      setPolls([]);
    } else {
      const data = await res.json();
      setPolls(data.polls || []);
    }
    setLoading(false);
  }, [session?.access_token]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) setCategories(await res.json());
  }, [session?.access_token]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchPolls();
    fetchCategories();
    fetchUsers();
  }, [session, fetchPolls, fetchCategories, fetchUsers]);

  // Add poll
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setError("");
    setSuccess("");
    if (!addForm.question.trim()) {
      setError("Please enter a poll question.");
      setAddLoading(false);
      return;
    }
    if (addForm.choices.some((c: string) => !c.trim())) {
      setError("All choices must be filled in.");
      setAddLoading(false);
      return;
    }
    if (addForm.choices.length < MIN_CHOICES) {
      setError("At least two choices are required.");
      setAddLoading(false);
      return;
    }
    if (!addForm.category_id) {
      setError("Please select a category.");
      setAddLoading(false);
      return;
    }
    if (!addForm.user_id) {
      setError("Please select a creator.");
      setAddLoading(false);
      return;
    }
    const res = await fetch("/api/admin/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(addForm),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to add poll");
    } else {
      setSuccess("Poll added!");
      setAddForm({ question: "", visibility: "public", max_choices: 1, category_id: "", user_id: "", choices: ["", ""] });
      fetchPolls();
    }
    setAddLoading(false);
  };

  // Add/Remove/Edit choices for Add Poll
  const handleAddChoice = () => {
    setAddForm(f => ({ ...f, choices: [...f.choices, ""] }));
  };
  const handleRemoveChoice = (idx: number) => {
    if (addForm.choices.length <= MIN_CHOICES) return;
    setAddForm(f => ({ ...f, choices: f.choices.filter((_, i) => i !== idx) }));
  };
  const handleChoiceChange = (idx: number, value: string) => {
    setAddForm(f => {
      const newChoices = [...f.choices];
      newChoices[idx] = value;
      return { ...f, choices: newChoices };
    });
  };

  // Edit poll
  const startEdit = (poll: Poll) => {
    setEditId(poll.id);
    setEditForm({
      question: poll.question,
      visibility: poll.visibility,
      max_choices: poll.max_choices,
      category_id: poll.category_id,
    });
  };
  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ question: "", visibility: "public", max_choices: 1, category_id: "" });
  };
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/polls", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id: editId, ...editForm }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to edit poll");
    } else {
      setSuccess("Poll updated!");
      cancelEdit();
      fetchPolls();
    }
    setEditLoading(false);
  };

  // Delete poll
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return;
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/polls", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to delete poll");
    } else {
      setSuccess("Poll deleted!");
      fetchPolls();
    }
  };

  // Tabs
  const [tab, setTab] = useState(0);
  const tabs = ["All Polls", "Add Poll", "Edit Polls"];

  return (
    <div>
      <div className="mb-6 flex gap-4 border-b bg-card dark:bg-poll-darker rounded-t-lg p-4">
        {POLL_TABS.map((t, idx) => (
          <button
            key={t}
            className={`pb-2 px-4 font-medium border-b-2 transition-colors ${tab === idx ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}
            onClick={() => setTab(idx)}
          >
            {t}
          </button>
        ))}
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {/* All Polls */}
      {tab === 0 && (
        <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Question</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Visibility</th>
                  <th className="py-2">Max Choices</th>
                  <th className="py-2">Creator</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id} className="border-t">
                    <td className="py-2">{poll.question}</td>
                    <td className="py-2">{poll.categories?.name || poll.category_id}</td>
                    <td className="py-2">{poll.visibility}</td>
                    <td className="py-2">{poll.max_choices}</td>
                    <td className="py-2">{poll.profiles?.username || poll.user_id}</td>
                    <td className="py-2">
                      <button
                        className="text-blue-600 mr-4"
                        onClick={() => startEdit(poll)}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') startEdit(poll);
                        }}
                      ><PencilSquareIcon className="w-5 h-5 inline mr-1" /> Edit</button>
                      <button
                        className="text-red-600"
                        onClick={() => handleDelete(poll.id)}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') handleDelete(poll.id);
                        }}
                      ><TrashIcon className="w-5 h-5 inline mr-1" /> Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {/* Add Poll */}
      {tab === 1 && (
        <form onSubmit={handleAdd} className="bg-card dark:bg-poll-darker rounded shadow p-6 max-w-md border border-border">
          <label className="block mb-2 font-medium" htmlFor="add-question">Question</label>
          <input
            id="add-question"
            type="text"
            className="border rounded p-2 w-full mb-4"
            value={addForm.question}
            onChange={e => setAddForm(f => ({ ...f, question: e.target.value }))}
            required
          />
          <label className="block mb-2 font-medium" htmlFor="add-choice-0">Choices</label>
          <div className="flex flex-col gap-3 mb-4">
            {addForm.choices.map((choice, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <label htmlFor={`add-choice-${idx}`} className="sr-only">Choice {idx + 1}</label>
                <input
                  id={`add-choice-${idx}`}
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Choice ${idx + 1}`}
                  value={choice}
                  onChange={e => handleChoiceChange(idx, e.target.value)}
                  required
                  aria-label={`Choice ${idx + 1}`}
                  aria-required="true"
                  tabIndex={0}
                />
                {addForm.choices.length > MIN_CHOICES && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChoice(idx)}
                    className="text-red-500 hover:text-red-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`Remove choice ${idx + 1}`}
                    tabIndex={0}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddChoice}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline"
            aria-label="Add another choice"
            tabIndex={0}
          >
            + Add another choice
          </button>
          <label htmlFor="add-category" className="block mb-2 font-medium">Category</label>
          <select
            id="add-category"
            className="border rounded p-2 w-full mb-4"
            value={addForm.category_id}
            onChange={e => setAddForm(f => ({ ...f, category_id: e.target.value }))}
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <label htmlFor="add-visibility" className="block mb-2 font-medium">Visibility</label>
          <select
            id="add-visibility"
            className="border rounded p-2 w-full mb-4"
            value={addForm.visibility}
            onChange={e => setAddForm(f => ({ ...f, visibility: e.target.value }))}
            required
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <label htmlFor="add-max-choices" className="block mb-2 font-medium">Max Choices</label>
          <input
            id="add-max-choices"
            type="number"
            min={1}
            max={8}
            className="border rounded p-2 w-full mb-4"
            value={addForm.max_choices}
            onChange={e => setAddForm(f => ({ ...f, max_choices: Number(e.target.value) }))}
            required
          />
          <label htmlFor="add-creator" className="block mb-2 font-medium">Creator (User)</label>
          <select
            id="add-creator"
            className="border rounded p-2 w-full mb-4"
            value={addForm.user_id}
            onChange={e => setAddForm(f => ({ ...f, user_id: e.target.value }))}
            required
          >
            <option value="" disabled>Select a user</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username || user.id}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            disabled={addLoading}
          ><PlusIcon className="w-5 h-5 inline mr-1" /> {addLoading ? "Adding..." : "Add Poll"}</button>
        </form>
      )}
      {/* Edit Polls */}
      {tab === 2 && (
        <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Question</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Visibility</th>
                  <th className="py-2">Max Choices</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {polls.map((poll) => (
                  <tr key={poll.id} className="border-t">
                    <td className="py-2">
                      {editId === poll.id ? (
                        <form onSubmit={handleEdit} className="flex gap-2">
                          <input
                            type="text"
                            className="border rounded p-2"
                            value={editForm.question}
                            onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))}
                            required
                          />
                          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={editLoading}><CheckIcon className="w-5 h-5 inline mr-1" /> Save</button>
                          <button type="button" className="bg-gray-300 px-3 py-1 rounded" onClick={cancelEdit}><XMarkIcon className="w-5 h-5 inline mr-1" /> Cancel</button>
                        </form>
                      ) : (
                        poll.question
                      )}
                    </td>
                    <td className="py-2">{poll.categories?.name || poll.category_id}</td>
                    <td className="py-2">{poll.visibility}</td>
                    <td className="py-2">{poll.max_choices}</td>
                    <td className="py-2">
                      {editId !== poll.id && (
                        <>
                          <button className="text-blue-600 mr-4" onClick={() => startEdit(poll)}><PencilSquareIcon className="w-5 h-5 inline mr-1" /> Edit</button>
                          <button className="text-red-600" onClick={() => handleDelete(poll.id)}><TrashIcon className="w-5 h-5 inline mr-1" /> Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileTab: React.FC<{ session: any }> = ({ session }) => {
  const [profile, setProfile] = useState<any>(null);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editForm, setEditForm] = useState({ username: "", display_name: "", avatar_url: "", bio: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile and polls
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setError("Failed to fetch profile");
      setProfile(null);
      setPolls([]);
    } else {
      const { profile, polls } = await res.json();
      setProfile(profile);
      setPolls(polls);
      setEditForm({
        username: profile.username || "",
        display_name: profile.display_name || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || "",
      });
    }
    setLoading(false);
  }, [session?.access_token]);

  useEffect(() => { fetchProfile(); }, [session, fetchProfile]);

  // Update profile
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setError("");
    setSuccess("");
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
      fetchProfile();
    }
    setEditLoading(false);
  };

  // Drag-and-drop avatar upload
  const handleAvatarDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setAvatarUploading(true);
    setError("");
    setSuccess("");
    const file = e.dataTransfer.files[0];
    if (!file) return setAvatarUploading(false);
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

  // Password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordError(error.message || "Failed to update password");
    } else {
      setPasswordSuccess("Password updated!");
      setShowPasswordModal(false);
      setPassword("");
    }
    setPasswordLoading(false);
  };

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
                className="w-20 h-20 rounded-full border flex items-center justify-center bg-gray-100 cursor-pointer relative"
                role="button"
                tabIndex={0}
                onDrop={handleAvatarDrop}
                onDragOver={e => e.preventDefault()}
                onClick={handleAvatarClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAvatarClick();
                  }
                }}
                title="Drag and drop or click to upload"
                aria-label="Upload avatar image"
                style={{ overflow: "hidden" }}
              >
                <Image
                  src={editForm.avatar_url || "/default-avatar.png"}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                  priority
                />
                {avatarUploading && (
                  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center text-blue-600 font-bold">Uploading...</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarFile}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="avatar-url" className="block font-medium mb-1">Avatar URL</label>
                <input
                  id="avatar-url"
                  type="text"
                  className="border rounded p-2 w-full"
                  value={editForm.avatar_url}
                  onChange={e => setEditForm(f => ({ ...f, avatar_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <label htmlFor="display-name" className="block font-medium mb-1">Display Name</label>
            <input
              id="display-name"
              type="text"
              className="border rounded p-2 w-full mb-4"
              value={editForm.display_name}
              onChange={e => setEditForm(f => ({ ...f, display_name: e.target.value }))}
              required
            />
            <label htmlFor="username" className="block font-medium mb-1">Username</label>
            <input
              id="username"
              type="text"
              className="border rounded p-2 w-full mb-4"
              value={editForm.username}
              onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <label htmlFor="bio" className="block font-medium mb-1">Bio</label>
            <textarea
              id="bio"
              className="border rounded p-2 w-full mb-4"
              value={editForm.bio}
              onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="A short bio about you..."
            />
            <label htmlFor="email" className="block font-medium mb-1">Email</label>
            <input
              id="email"
              type="text"
              className="border rounded p-2 w-full mb-4 bg-gray-100 cursor-not-allowed"
              value={session.user.email}
              disabled
            />
            <div className="flex gap-4 items-center mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
                disabled={editLoading}
              ><CheckIcon className="w-5 h-5 inline mr-1" /> {editLoading ? "Saving..." : "Save Changes"}</button>
              <button
                type="button"
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold border"
                onClick={() => setShowPasswordModal(true)}
              ><LockClosedIcon className="w-5 h-5 inline mr-1" /> Change Password</button>
            </div>
          </form>
          {/* Password Change Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-poll-grey-900 border border-poll-grey-700 text-poll-grey-100 rounded-lg shadow-lg p-8 max-w-sm w-full relative">
                <button
                  className="absolute top-2 right-2 text-poll-grey-400 hover:text-poll-grey-200"
                  onClick={() => setShowPasswordModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                {passwordError && <div className="text-red-600 mb-2">{passwordError}</div>}
                {passwordSuccess && <div className="text-green-600 mb-2">{passwordSuccess}</div>}
                <form onSubmit={handlePasswordChange}>
                  <label htmlFor="new-password" className="block font-medium mb-1">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="border rounded p-2 w-full mb-4"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full"
                    disabled={passwordLoading}
                  ><CheckIcon className="w-5 h-5 inline mr-1" /> {passwordLoading ? "Updating..." : "Update Password"}</button>
                </form>
              </div>
            </div>
          )}
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-xl font-semibold mb-4">My Polls</h3>
            {polls.length === 0 ? (
              <div className="text-gray-500">You haven&apos;t created any polls yet.</div>
            ) : (
              <ul className="divide-y">
                {polls.map((poll) => (
                  <li key={poll.id} className="py-3">
                    <div className="font-medium">{poll.question}</div>
                    <div className="text-gray-500 text-sm">
                      {new Date(poll.created_at).toLocaleString()} | Category: {poll.category_id} | Visibility: {poll.visibility} | Max Choices: {poll.max_choices}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

const UserAdminPanel: React.FC<{ session: any }> = ({ session }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch users (non-admins by default)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit), non_admin: "true" });
    const res = await fetch(`/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) {
      setError("Failed to fetch users");
      setUsers([]);
      setTotal(0);
    } else {
      const { users, total } = await res.json();
      setUsers(users);
      setTotal(total);
    }
    setLoading(false);
  }, [session?.access_token, search, page, limit]);

  useEffect(() => { fetchUsers(); }, [search, page, session, fetchUsers]);

  // Ban/unban, promote/demote, soft delete
  const handleUpdate = async (id: string, updates: any) => {
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!res.ok) {
      setError((await res.json()).message || "Failed to update user");
    } else {
      setSuccess("User updated!");
      fetchUsers();
    }
    setEditLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError("");
    setSuccess("");
    // Soft delete: set deleted flag
    await handleUpdate(id, { deleted: true });
  };

  // Pagination
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <input
          type="text"
          className="border rounded p-2 w-full md:w-64"
          placeholder="Search users..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search users"
        />
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="bg-card dark:bg-poll-darker rounded shadow p-6 border border-border">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Avatar</th>
                  <th className="py-2">Display Name</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Banned</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2">
                      <Image src={user.avatar_url || "/default-avatar.png"} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    </td>
                    <td className="py-2">{user.display_name || <span className="text-gray-400">(none)</span>}</td>
                    <td className="py-2">{user.username}</td>
                    <td className="py-2">{user.banned ? "Yes" : "No"}</td>
                    <td className="py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2 flex gap-2 flex-wrap">
                      <button className="text-blue-600 underline flex items-center gap-1" onClick={() => setViewUser(user)} aria-label="View profile"><EyeIcon className="w-5 h-5" />View</button>
                      <button
                        className="text-yellow-600 underline flex items-center gap-1"
                        disabled={editLoading}
                        onClick={() => handleUpdate(user.id, { is_admin: true })}
                        aria-label="Promote to admin"
                      >
                        <ArrowPathIcon className="w-5 h-5" />Promote
                      </button>
                      <button
                        className="text-red-600 underline flex items-center gap-1"
                        disabled={editLoading}
                        onClick={() => handleUpdate(user.id, { banned: !user.banned })}
                        aria-label={user.banned ? "Unban user" : "Ban user"}
                      >
                        <LockClosedIcon className="w-5 h-5" />{user.banned ? "Unban" : "Ban"}
                      </button>
                      <button
                        className="text-gray-600 underline flex items-center gap-1"
                        disabled={editLoading}
                        onClick={() => handleDelete(user.id)}
                        aria-label="Delete user"
                      >
                        <TrashIcon className="w-5 h-5" />Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
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
          </>
        )}
      </div>
      {/* View Profile Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-poll-grey-900 border border-poll-grey-700 text-poll-grey-100 rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-poll-grey-400 hover:text-poll-grey-200"
              onClick={() => setViewUser(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-4">User Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <Image src={viewUser.avatar_url || "/default-avatar.png"} alt="avatar" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <div className="font-bold text-lg">{viewUser.display_name || viewUser.username}</div>
                <div className="text-gray-500">@{viewUser.username}</div>
                <div className="text-gray-500 text-sm">{viewUser.banned ? "Banned" : "Active"}</div>
                <div className="text-gray-500 text-sm">Joined: {new Date(viewUser.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            {/* Add more profile info here if needed */}
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded font-semibold w-full flex items-center justify-center gap-2"
              onClick={() => setViewUser(null)}
              aria-label="Close profile modal"
            >
              <XMarkIcon className="w-5 h-5" />Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>("Polls");
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const [session, setSession] = useState<any>(null);
  const [sidebarMinimized, setSidebarMinimized] = useState<boolean>(false);

  // Persist sidebar state
  useEffect(() => {
    const minimized = localStorage.getItem("adminSidebarMinimized");
    setSidebarMinimized(minimized === "true");
  }, []);
  useEffect(() => {
    localStorage.setItem("adminSidebarMinimized", sidebarMinimized ? "true" : "false");
  }, [sidebarMinimized]);

  useEffect(() => {
    const checkAdmin = async () => {
      setLoading(true);
      setError("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You must be logged in as an admin to access this page.");
        setLoading(false);
        return;
      }
      setSession(session);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (profileError || !profile) {
        setError("Could not fetch your profile.");
        setLoading(false);
        return;
      }
      if (!profile.is_admin) {
        setError("You are not authorized to access the admin panel.");
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      setLoading(false);
    };
    checkAdmin();
  }, []);

  // Tabs per section
  const getTabs = () => {
    switch (activeSection) {
      case "Polls": return POLL_TABS;
      case "Users": return USER_TABS;
      case "Categories": return CATEGORY_TABS;
      case "Profile": return [];
      default: return [];
    }
  };

  // Placeholder content per tab
  const renderTabContent = () => {
    const tab = getTabs()[activeTab];
    return (
      <div className="p-6 bg-white rounded shadow min-h-[300px]">
        <h2 className="text-xl font-semibold mb-2">{tab}</h2>
        <div className="text-gray-500">(Content for {tab} will go here.)</div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;
  }
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Admin Panel</h1>
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 bg-card dark:bg-poll-darker border border-border rounded-lg shadow p-6 flex flex-col gap-4">
          {SIDEBAR_ITEMS.map((item, idx) => (
            <button
              key={item.label}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium text-foreground hover:bg-accent transition-colors"
              onClick={() => { setActiveSection(item.label as SidebarSection); setActiveTab(0); }}
              aria-label={item.label}
              tabIndex={0}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>
        {/* Main content */}
        <main className="flex-1 bg-background rounded-lg shadow p-8 border border-border">
          {activeSection === "Categories" ? (
            session && <CategoryTabs session={session} />
          ) : activeSection === "Polls" ? (
            <PollTabs session={session} />
          ) : activeSection === "Profile" ? (
            <ProfileTab session={session} />
          ) : activeSection === "Users" ? (
            <UserAdminPanel session={session} />
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-6 flex gap-4 border-b">
                {getTabs().map((tab, idx) => (
                  <button
                    key={tab}
                    className={`pb-2 px-4 font-medium border-b-2 transition-colors ${activeTab === idx ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-blue-600"}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {renderTabContent()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;