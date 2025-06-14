import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"; // Added useMemo
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import {
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ChartPieIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartOptions } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import dynamic from 'next/dynamic';
import { RadioIcon, SignalIcon } from "lucide-react";
// For emoji-mart v5+:
// npm install @emoji-mart/react
const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function PieChart({ data, title, className }: any) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          "#14b8a6", "#f97316", "#ef4444", "#3b82f6", "#64748b", "#0d9488", "#ea580c", "#dc2626",
        ],
        borderColor: [
          "#0d9488", "#ea580c", "#dc2626", "#2563eb", "#475569", "#0f766e", "#c2410c", "#b91c1c",
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: "#ffffff",
      },
    ],
  };
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#cbd5e1",
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    elements: { arc: { borderJoinStyle: "round" } },
  };
  return (
    <div className={`bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg p-6 ${className || ''}`}>
      {title && <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>}
      <div className="h-80">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

function BarChart({ data, title, className, orientation = "vertical" }: any) {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((dataset: any, index: number) => ({
      ...dataset,
      backgroundColor:
        dataset.backgroundColor ||
        ["#14b8a6", "#f97316", "#ef4444", "#3b82f6", "#64748b"][index % 5],
      borderColor:
        dataset.borderColor ||
        ["#0d9488", "#ea580c", "#dc2626", "#2563eb", "#475569"][index % 5],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    })),
  };
  const options: ChartOptions<'bar'> = {
    indexAxis: orientation === "horizontal" ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#cbd5e1",
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "#475569",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#374151" },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#374151" },
        ticks: { 
          color: "#9ca3af", 
          font: { size: 11 },
          stepSize: 1, // Ensure y-axis increments by 1
        },
        // Calculate max Y value to add padding
        afterDataLimits: (axis: any) => {
          axis.max = axis.max * 1.1 +1; // Add 10% padding and ensure at least 1 unit above max
        }
      },
    },
    elements: { bar: { borderWidth: 2 } },
  };
  return (
    <div className={`bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg p-6 ${className || ''}`}>
      {title && <h3 className="text-white font-semibold mb-4 text-center">{title}</h3>}
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

const PollPage: React.FC = () => {
  const router = useRouter();
  // Ensure pollId is always a string
  const pollIdRaw = router.query.pollId;
  const pollId = typeof pollIdRaw === 'string' ? pollIdRaw : Array.isArray(pollIdRaw) ? pollIdRaw[0] : '';
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState<any>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const [chat, setChat] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [user, setUser] = useState<any>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [pollPassword, setPollPassword] = useState<string | null>(null);
  const [chatSidebarOpen, setChatSidebarOpen] = useState(true);
  const [chatSidebarMinimized, setChatSidebarMinimized] = useState(false);

  // Fetch votes and chat as functions for reuse
  const fetchVotes = useCallback(async () => {
    if (!pollId) return; // Added guard for pollId
    console.log('Fetching votes for poll:', pollId);
    const { data: votesData, error } = await supabase
      .from("votes")
      .select("id, choice_id, user_id, profiles(display_name)")
      .eq("poll_id", pollId);
    if (error) console.error('Votes fetch error:', error);
    console.log('Votes fetched successfully:', votesData?.length || 0, 'votes');
    setVotes(votesData || []);
  }, [pollId]);
  const fetchChat = useCallback(async () => {
    if (!pollId) return; // Added guard for pollId
    const { data: chatData, error } = await supabase
      .from("chat_messages")
      .select("id, user_id, message, created_at, profiles(display_name)")
      .eq("poll_id", pollId)
      .order("created_at");
    if (error) console.error('Chat fetch error:', error);
    setChat(chatData || []);
    console.log('chat', chatData);
  }, [pollId]);

  // Fetch poll, choices, votes, chat, and user
  useEffect(() => {
    if (!pollId) return;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      // Get user
      const { data: sessionData } = await supabase.auth.getSession();
      setUser(sessionData?.session?.user || null);
      // Fetch poll (include password and visibility)
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("id, question, max_choices, visibility, password")
        .eq("id", pollId)
        .single();
      if (pollError || !pollData) {
        setError("Poll not found");
        setLoading(false);
        return;
      }
      setPoll(pollData);
      setPollPassword(pollData.password || null);
      // Password protection for private polls
      if (pollData.visibility === "private") {
        const stored = localStorage.getItem(`poll_pwd_${pollId}`);
        if (!stored || stored !== pollData.password) {
          setPasswordRequired(true);
          setLoading(false);
          return;
        }
      }
      setPasswordRequired(false);
      // Fetch choices
      const { data: choicesData } = await supabase
        .from("choices")
        .select("id, text, order")
        .eq("poll_id", pollId)
        .order("order");
      setChoices(choicesData || []);
      await fetchVotes();
      await fetchChat();
      setLoading(false);
      // Debug logs
      console.log('pollId', pollId);
      console.log('choices', choicesData);
    };
    fetchData();
  }, [pollId, fetchVotes, fetchChat]); // Added fetchVotes and fetchChat

  // Supabase Realtime for votes and chat
  useEffect(() => {
    if (!pollId) return;

    const votesChannel = supabase
      .channel('votes-poll-' + pollId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `poll_id=eq.${pollId}` }, (payload: any) => {
        console.log('Votes event received:', payload);
        fetchVotes();
      });

    const chatChannel = supabase
      .channel('chat-poll-' + pollId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `poll_id=eq.${pollId}` }, (payload: any) => {
        console.log('Chat event received:', payload);
        fetchChat();
      });

    votesChannel.subscribe((status: string) => {
      console.log(`Votes channel status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to votes channel');
      }
    });
    
    chatChannel.subscribe((status: string) => {
      console.log(`Chat channel status: ${status}`);
    });

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(chatChannel);
    };
  }, [pollId, fetchVotes, fetchChat]); // Added fetchVotes and fetchChat

  // Check if user has voted (by user id if available, else localStorage)
  useEffect(() => {
    if (!pollId) return;
    if (user) {
      const voted = votes.some(v => v.user_id === user.id);
      setHasVoted(voted);
    } else if (localStorage.getItem(`voted_${pollId}`)) {
      setHasVoted(true);
    }
  }, [pollId, user, votes]);

  // Ensure charts update immediately after votes change
  useEffect(() => {
    console.log('Votes updated, chart data should refresh:', votes.length, 'total votes');
  }, [votes]);

  // Chart data
  const { chartData, maxVoteCount } = useMemo(() => {
    const data = {
      labels: ["Votes"],
      datasets: choices.map((choice, index) => {
        const voteCount = votes.filter(v => String(v.choice_id) === String(choice.id)).length;
        return {
          label: choice.text,
          data: [voteCount],
          backgroundColor: "#14b8a6 #f97316 #ef4444 #3b82f6 #64748b #0d9488 #ea580c #dc2626".split(" ")[index % 8],
          borderColor: "#0d9488 #ea580c #dc2626 #2563eb #475569 #0f766e #c2410c #b91c1c".split(" ")[index % 8],
          borderWidth: 2,
          borderRadius: 6,
        };
      }),
    };
    
    // Calculate the maximum vote count among all choices
    const maxCount = data.datasets.reduce((max, dataset) => 
      Math.max(max, ...dataset.data), 0);
      
    return { chartData: data, maxVoteCount: maxCount };
  }, [choices, votes]);



  // Specific options for bar chart
  const ChartOptions: ChartOptions<'bar'> = useMemo(() => {
    // Calculate max value to show (at least 5, or highest vote count + 1)
    const maxDisplayValue = Math.max(5, maxVoteCount + 1);
    
    // Calculate step size to get approximately 5 ticks
    const stepSize = Math.max(1, Math.ceil(maxDisplayValue / 5));
    
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
      legend: {
        position: 'bottom',
        align: 'center' as const,
        labels: {
          color: "#cbd5e1",
          padding: 20,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,     
        grid: { color: "#374151" },
        max: maxDisplayValue,
        ticks: { 
          color: "#9ca3af", 
          font: { size: 11 },
          stepSize: stepSize,
          // Ensure we only display whole numbers
          callback: function(value) {
            const numValue = Number(value);
            return numValue % 1 === 0 ? numValue : '';
          }
        }
      },
      y: {
        display: false
      }
    }
  };
  }, [maxVoteCount]);

  // Emoji picker
  const handleEmojiSelect = (emoji: any) => {
    // emoji-mart v3+ uses 'onEmojiSelect' and emoji.unified or emoji.native
    setChatInput(chatInput + (emoji.native || emoji.unified || emoji.colons || ""));
    setShowEmoji(false);
    chatInputRef.current?.focus();
  };

  // Handle voting
  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setError("Please select at least one choice.");
      return;
    }
    if (hasVoted) {
      setError("You have already voted in this poll.");
      return;
    }
    try {
      for (const choiceId of selected) {
        const { error } = await supabase.from("votes").insert({ poll_id: pollId, choice_id: choiceId, user_id: user?.id });
        if (error) {
          if (error.code === "23505") { // unique_violation
            setError("You have already voted in this poll.");
            setHasVoted(true); // Immediately set hasVoted to true on duplicate
            return;
          } else {
            throw error;
          }
        }
      }
      if (!user) localStorage.setItem(`voted_${pollId}`, "1");
      setHasVoted(true); // Immediately set hasVoted to true on success
      
      // Immediately fetch votes to update the chart
      fetchVotes();
    } catch (err: any) {
      setError("Failed to submit vote. Please try again.");
    }
  };

  // Handle chat send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setSending(true);
    await supabase.from("chat_messages").insert({ poll_id: pollId, message: chatInput, user_id: user?.id });
    setChatInput("");
    setSending(false);
    setShowEmoji(false);
    chatInputRef.current?.focus();
    // Do NOT refetch chat here; let realtime handle it
  };

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded shadow p-8 max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4">Private Poll</h2>
          <p className="mb-4 text-gray-700">This poll is private. Please enter the password to view and vote.</p>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (passwordInput === pollPassword) {
                localStorage.setItem(`poll_pwd_${pollId}`, passwordInput);
                setPasswordRequired(false);
                setPasswordError("");
                // Refetch poll data
                setLoading(true);
                setTimeout(() => setLoading(false), 300); // quick re-render
              } else {
                setPasswordError("Incorrect password. Please try again.");
              }
            }}
            className="flex flex-col gap-4"
          >
            <input
              type="password"
              className="border rounded p-2"
              placeholder="Enter password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              aria-label="Poll password"
              // autoFocus // Removed autoFocus
            />
            {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Map poll chat and votes to ChatSidebar format
  const chatMessages: ChatMessage[] = [
    ...votes.map((vote, idx) => ({
      id: 10000 + idx,
      user: vote.profiles?.display_name || "User",
      message: `voted for ${choices.find(c => c.id === vote.choice_id)?.text || "[choice]"}`,
      timestamp: "",
      isOwn: user && vote.user_id === user.id,
      type: "system" as const,
    })),
    ...chat.map((msg) => ({
      id: msg.id,
      user: msg.profiles?.display_name || "User",
      message: msg.message,
      timestamp: msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      isOwn: user && msg.user_id === user.id,
      type: "text" as const,
    })),
  ];
  const chatUsers: ChatUser[] = Array.from(
    new Set([
      ...votes.map(v => v.profiles?.display_name),
      ...chat.map(m => m.profiles?.display_name),
    ])
  ).filter(Boolean).map((name, i) => ({
    id: i + 1,
    name: name as string,
    status: "online",
  }));

  return (
    <div className="bg-poll-dark text-poll-grey-100">
      <div className="w-full text-center py-14">
      <h1 className="text-6xl font-bold mb-2">
        Poll<span className="text-[#14b8a6]">.it</span>
      </h1>
      <p className="text-poll-grey-400 text-2xl">
        Engaging polls and real-time insights from your community
      </p>
    </div>

      <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4 pb-8">
        {/* Poll Display Section (2/3 width) */}
        <div className="w-full lg:w-2/3">
          <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg p-6">
            {loading ? (
              <div className="text-poll-grey-400 text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-poll-salmon-500 text-center py-8">{error}</div>
            ) : poll ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#14b8a6]">
                    <path d="M12 20v-6" />
                    <path d="M6 20V10" />
                    <path d="M18 20V4" />
                  </svg>
                  <h2 className="text-xl font-semibold">Live Results</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-white text-4xl font-semibold mb-2">{poll.question}</h3>
                    <div className="flex items-center gap-4 text-sm text-poll-grey-400">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {votes.length} votes
                      </span>
                    </div>
                  </div>

                  {/* Chart Toggle */}
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-poll-blue-400 ${showBar ? 'bg-poll-blue-500 text-white border-poll-blue-600 shadow' : 'bg-poll-grey-900 text-poll-grey-300 border-poll-grey-700 hover:bg-poll-grey-800'}`}
                      onClick={() => setShowBar(true)}
                    >
                      <ChartBarIcon className="w-5 h-5 inline-block mr-1 align-text-bottom" /> Bar
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-poll-orange-400 ${!showBar ? 'bg-poll-orange-500 text-white border-poll-orange-600 shadow' : 'bg-poll-grey-900 text-poll-grey-300 border-poll-grey-700 hover:bg-poll-grey-800'}`}
                      onClick={() => setShowBar(false)}
                    >
                      <ChartPieIcon className="w-5 h-5 inline-block mr-1 align-text-bottom" /> Pie
                    </button>
                  </div>

                  {/* Chart */}
                  <div className="bg-poll-grey-900/50 rounded-lg p-4">
                    {chartData.datasets[0].data.every((v: number) => v === 0) ? (
                      <div className="text-poll-grey-500 text-center py-8">No votes yet</div>
                    ) : showBar ? (
                      <div className="h-80">
                        <Bar 
                          key={`bar-chart-${votes.length}`}
                          data={chartData} 
                          options={ChartOptions} 
                        />
                      </div>
                    ) : (
                      <PieChart
                        key={`pie-chart-${votes.length}`}
                        data={{
                          labels: choices.map(c => c.text),
                          values: choices.map(c => votes.filter(v => String(v.choice_id) === String(c.id)).length),
                        }}
                      />
                    )}
                  </div>

                  {/* Voting Form */}
                  {!hasVoted && (
                    <form onSubmit={handleVote} className="space-y-4">
                      <div className="space-y-3">
                        {choices.map(choice => (
                          <label
                            key={choice.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-poll-grey-700 bg-poll-grey-900/50 hover:bg-poll-grey-800/50 cursor-pointer transition-colors"
                          >
                            {poll.max_choices > 1 ? (
                              <input
                                type="checkbox"
                                value={choice.id}
                                checked={selected.includes(choice.id)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    if (selected.length < poll.max_choices) {
                                      setSelected([...selected, choice.id]);
                                    }
                                  } else {
                                    setSelected(selected.filter(id => id !== choice.id));
                                  }
                                }}
                                className="accent-[#14b8a6]"
                              />
                            ) : (
                              <input
                                type="radio"
                                name="choice"
                                value={choice.id}
                                checked={selected[0] === choice.id}
                                onChange={() => setSelected([choice.id])}
                                className="accent-[#14b8a6]"
                              />
                            )}
                            <span className="text-poll-grey-100">{choice.text}</span>
                          </label>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={selected.length === 0}
                        className="w-full h-10 rounded-md bg-[#14b8a6] text-white font-medium hover:bg-[#0d9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ChartBarIcon className="w-5 h-5" />
                        Vote Now
                      </button>

                      {error && <div className="text-poll-salmon-500 text-sm text-center">{error}</div>}
                    </form>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Chat Section (1/3 width) */}
        <div className="w-full lg:w-1/3 lg:sticky lg:top-20 self-start mb-8">
          <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg h-[calc(50vh)] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-poll-grey-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-poll-orange-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </span>
                  <h2 className="font-semibold">Chat</h2>
                  <span className="text-sm text-gray-400">({chatUsers.length} users)</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.type === "system"
                        ? "bg-poll-grey-800/30 text-poll-grey-400 text-sm"
                        : msg.isOwn
                        ? "bg-[#14b8a6] text-white"
                        : "bg-poll-grey-800 text-poll-grey-100"
                    }`}
                  >
                    {msg.type !== "system" && (
                      <div className="font-medium text-sm mb-1">
                        {msg.user}
                        {msg.timestamp && (
                          <span className="text-xs opacity-50 ml-2">
                            {msg.timestamp}
                          </span>
                        )}
                      </div>
                    )}
                    <div className={msg.type === "system" ? "italic" : ""}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-poll-grey-700">
              <form onSubmit={handleSendChat} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 bg-poll-grey-800 text-poll-grey-100 rounded-lg border border-poll-grey-700 focus:outline-none focus:border-[#14b8a6] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmoji(!showEmoji)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-poll-grey-400 hover:text-poll-grey-300"
                  >
                    😊
                  </button>
                  {showEmoji && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <Picker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sending || !chatInput.trim()}
                  className="px-4 py-2 bg-[#14b8a6] text-white rounded-lg hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Type definitions for chat
interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  type: "text" | "poll" | "system";
}

interface ChatUser {
  id: number;
  name: string;
  status: "online" | "away" | "offline";
}

export default PollPage;