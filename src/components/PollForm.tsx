import React, { useState, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/navigation";
import {
  XMarkIcon as CloseIcon,
  ClipboardIcon,
  CheckIcon,
  ShareIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

// Constants
const POLL_VISIBILITY = ["public", "private"] as const;
type PollVisibility = typeof POLL_VISIBILITY[number];

type Category = {
  id: string;
  name: string;
};

type PollFormState = {
  question: string;
  choices: string[];
  visibility: PollVisibility;
  category_id: string;
  allow_multiple: boolean;
};

const MIN_CHOICES = 2;

const PollForm: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState<boolean>(true);
  const [catError, setCatError] = useState<string>("");
  const [form, setForm] = useState<PollFormState>({
    question: "",
    choices: ["", ""],
    visibility: "public",
    category_id: "",
    allow_multiple: false,
  });
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [pollUrl, setPollUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [pollPassword, setPollPassword] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setCatLoading(true);
      setCatError("");
      const { data, error } = await supabase.from("categories").select("id, name").order("name");
      if (error) {
        setCatError("Failed to load categories");
        setCategories([]);
      } else {
        setCategories(data || []);
        // Set default category to 'Uncategorized' if exists
        const uncategorized = (data || []).find((cat: Category) => cat.name.toLowerCase() === "uncategorized");
        setForm((prev) => ({
          ...prev,
          category_id: uncategorized ? uncategorized.id : (data && data[0]?.id) || "",
          visibility: "public",
          allow_multiple: false,
        }));
      }
      setCatLoading(false);
    };
    fetchCategories();
  }, []);

  const handleQuestionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, question: e.target.value }));
  };

  const handleChoiceChange = (idx: number, value: string) => {
    setForm((prev) => {
      const newChoices = [...prev.choices];
      newChoices[idx] = value;
      return { ...prev, choices: newChoices };
    });
  };

  const handleAddChoice = () => {
    setForm((prev) => ({ ...prev, choices: [...prev.choices, ""] }));
  };

  const handleRemoveChoice = (idx: number) => {
    if (form.choices.length <= MIN_CHOICES) return;
    setForm((prev) => {
      const newChoices = prev.choices.filter((_, i) => i !== idx);
      return { ...prev, choices: newChoices };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.question.trim()) {
      setError("Please enter a poll question");
      return;
    }

    if (form.choices.some(c => !c.trim())) {
      setError("All choices must be filled out");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add authorization header only if user is logged in
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch("/api/poll", {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: form.question,
          choices: form.choices.filter(c => c.trim()),
          visibility: form.visibility,
          category_id: form.category_id,
          allow_multiple: form.allow_multiple,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create poll");

      // Reset form
      setForm({
        question: "",
        choices: ["", ""],
        visibility: "public",
        category_id: form.category_id,
        allow_multiple: false,
      });

      // Show success modal
      setPollUrl(`${window.location.origin}/poll/${result.pollId}`);
      setPollPassword(result.password || null);
      setShowModal(true);
      
    } catch (err: any) {
      setError(err.message || "Failed to create poll");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleCopyEmbed = async () => {
    try {
      // Create an iframe embed code
      const embedCode = `<iframe src="${pollUrl}/embed" width="100%" height="500" frameborder="0" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>`;
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 1500);
    } catch {
      setError("Failed to copy embed code");
    }
  };

  const handleGoToPoll = () => {
    // Extract the poll ID from the URL
    const pollId = pollUrl.split('/').pop();
    if (pollId) {
      router.push(`/poll/${pollId}`);
      setShowModal(false);
    }
  };

  // Social sharing functions
  const shareOnTwitter = () => {
    const text = `Check out my poll: ${form.question}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pollUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnWhatsApp = () => {
    const text = `Check out my poll: ${form.question} ${pollUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Poll Title */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">Poll Title</h2>
          <input
            type="text"
            className="w-full h-12 px-4 rounded-md bg-[#1e2736] border border-[#2f3a4e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
            placeholder="What's your question?"
            value={form.question}
            onChange={handleQuestionChange}
            required
          />
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-white">Poll Options</h2>
          <div className="space-y-3">
            {form.choices.map((choice, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 h-12 px-4 rounded-md bg-[#1e2736] border border-[#2f3a4e] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                  placeholder={`Option ${idx + 1}`}
                  value={choice}
                  onChange={e => handleChoiceChange(idx, e.target.value)}
                  required
                />
                {form.choices.length > MIN_CHOICES && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChoice(idx)}
                    className="w-12 flex items-center justify-center rounded-md bg-[#1e2736] border border-[#2f3a4e] text-gray-400 hover:text-white hover:border-red-500/50 transition-colors"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddChoice}
            className="mt-2 text-[#14b8a6] hover:text-[#0d9488] transition-colors font-medium flex items-center gap-1"
          >
            <PlusIcon className="w-5 h-5" />
            Add Option
          </button>
        </div>

        {/* Advanced Options */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-white font-semibold flex items-center gap-2 hover:text-[#14b8a6] transition-colors"
          >
            {showAdvanced ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="space-y-4 pl-7 border-l-2 border-[#2f3a4e]">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                {catLoading ? (
                  <div className="text-gray-400 text-sm">Loading categories...</div>
                ) : catError ? (
                  <div className="text-red-500 text-sm">{catError}</div>
                ) : (
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="w-full h-10 px-3 rounded-md bg-[#1e2736] border border-[#2f3a4e] text-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Poll Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value as PollVisibility }))}
                  className="w-full h-10 px-3 rounded-md bg-[#1e2736] border border-[#2f3a4e] text-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Multiple Choice Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.allow_multiple}
                    onChange={(e) => setForm((prev) => ({ ...prev, allow_multiple: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#2f3a4e] bg-[#1e2736] text-[#14b8a6] focus:ring-[#14b8a6] focus:ring-2"
                  />
                  Allow multiple selections
                </label>
                <p className="text-xs text-gray-400 mt-1">Allow voters to select multiple options</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {/* Create Poll Button */}
        <button
          type="submit"
          className="w-full h-12 mt-6 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
        >
          Create Poll
        </button>
      </form>

      {/* Poll Created Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1e2736] border border-[#2f3a4e] rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShareIcon className="w-5 h-5 text-[#14b8a6]" />
                Share Poll
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={pollUrl}
                  className="flex-1 h-10 px-3 rounded-md bg-[#151b26] border border-[#2f3a4e] text-white"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] transition-colors flex items-center gap-1"
                  aria-label="Copy poll link"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardIcon className="w-5 h-5" />
                      <span className="text-xs">COPY</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleGoToPoll}
                  className="px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  aria-label="Go to poll"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  <span className="text-xs">VIEW</span>
                </button>
              </div>
              
              
              {pollPassword && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-md">
                  <p className="text-yellow-200 text-sm font-medium">Private Poll Password</p>
                  <p className="text-yellow-100 font-mono mt-1">{pollPassword}</p>
                </div>
              )}
              
              {/* Social Share Section */}
              <div className="mt-4">
                <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-1.5">
                  <ShareIcon className="h-4 w-4 text-[#14b8a6]" />
                  Share on Social Media
                </h4>
                <div className="flex gap-6 justify-center">
                  
                  {/* Direct Link */}
                  <button
                    onClick={handleCopy}
                    className="p-2 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-full transition-colors"
                    aria-label="Copy direct link"
                  >
                    <LinkIcon className="w-5 h-5" />
                  </button>
                  {/* Embed */}
                  <button
                    onClick={handleCopyEmbed}
                    className="p-2 bg-poll-grey-500 hover:bg-poll-grey-600 text-white rounded-full transition-colors"
                    aria-label="Copy Embed Code"
                  >
                    <CodeBracketIcon className="w-5 h-5 text-[#ffffff]" />
                  </button>
                  {/* Twitter/X */}
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 bg-[#1DA1F2] hover:bg-[#1a96e0] text-white rounded-full transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  
                  {/* Facebook */}
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 bg-[#1877F2] hover:bg-[#166fe0] text-white rounded-full transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                    </svg>
                  </button>
                  
                  {/* LinkedIn */}
                  <button
                    onClick={shareOnLinkedIn}
                    className="p-2 bg-[#0077B5] hover:bg-[#006aa3] text-white rounded-full transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8ZM11 19h1a1 1 0 0 0 1-1v-4.5c0-1.235.902-2.5 2.5-2.5a1 1 0 0 1 1 1V18a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5.5a3.5 3.5 0 0 0-3.5-3.5A3.5 3.5 0 0 0 13 10.5V10a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1Z" />
                    </svg>
                  </button>
                  
                  {/* WhatsApp */}
                  <button
                    onClick={shareOnWhatsApp}
                    className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full transition-colors"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.668-1.612-.916-2.207-.241-.579-.486-.5-.668-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.648-.235-.374a9.861 9.861 0 01-1.511-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm0-18.271A8.383 8.383 0 003.615 12a8.307 8.307 0 001.115 4.177l-1.186 4.328 4.432-1.163A8.366 8.366 0 0011.992 20.5a8.383 8.383 0 008.378-8.38 8.34 8.34 0 00-2.457-5.936 8.339 8.339 0 00-5.92-2.47z" />
                    </svg>
                  </button>
                  
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PollForm;