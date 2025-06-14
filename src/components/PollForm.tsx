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
  ArrowTopRightOnSquareIcon
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
  });
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [pollUrl, setPollUrl] = useState("");
  const [copied, setCopied] = useState(false);
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
    if (!session) {
      setError("You must be logged in to create a poll");
      return;
    }

    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          question: form.question,
          choices: form.choices.filter(c => c.trim()),
          visibility: form.visibility,
          category_id: form.category_id,
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

  const handleGoToPoll = () => {
    // Extract the poll ID from the URL
    const pollId = pollUrl.split('/').pop();
    if (pollId) {
      router.push(`/poll/${pollId}`);
      setShowModal(false);
    }
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
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleGoToPoll}
                  className="px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  aria-label="Go to poll"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  View
                </button>
              </div>
              {pollPassword && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-md">
                  <p className="text-yellow-200 text-sm font-medium">Private Poll Password</p>
                  <p className="text-yellow-100 font-mono mt-1">{pollPassword}</p>
                </div>
              )}
              <button
                onClick={handleGoToPoll}
                className="w-full h-12 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                Go to Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PollForm;