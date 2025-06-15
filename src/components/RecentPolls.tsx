import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { 
  ChartBarIcon, 
  ShareIcon,
  XMarkIcon as CloseIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  CodeBracketIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { Calendar1Icon, ChartBarBigIcon, Clock } from "lucide-react";
interface Choice {
  id: string;
  text: string;
}

interface Category {
  name: string;
}

interface PollData {
  id: string;
  question: string;
  created_at: string;
  category: Category | null;
  choices: Choice[];
  votes: { choice_id: string }[];
}

interface ChoiceWithStats extends Choice {
  votes: number;
  percentage: number;
}

const RecentPolls: React.FC = () => {
  const router = useRouter();
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollInitialized, setIsScrollInitialized] = useState(false);
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<PollData | null>(null);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  // Fetch polls effect - get only polls from last 24 hours
  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        // Get date 24 hours ago
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const { data, error } = await supabase
          .from("polls")
          .select("*, category:categories(name), choices(id, text), votes(choice_id)")
          .eq("visibility", "public")
          .gt("created_at", oneDayAgo.toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) {
          setPolls(data as PollData[]);
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch and setup 30-second polling interval
    fetchPolls();
    const interval = setInterval(fetchPolls, 10000);
    return () => clearInterval(interval);
  }, [isScrollInitialized]);

  // Initialize scroll container
  useEffect(() => {
    if (scrollContainerRef.current && !isScrollInitialized) {
      setIsScrollInitialized(true);
    }
  }, [isScrollInitialized]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isScrollInitialized || !scrollContainerRef.current || polls.length <= 3) return;

    const container = scrollContainerRef.current;
    let scrolling = true;
    let animationFrameId: number | null = null;
    const scrollSpeed = 0.5; // pixels per frame
    const resetDelay = 1000; // ms to wait at the bottom before resetting
    let lastResetTime = 0;

    const scroll = () => {
      if (!scrolling || !container) return;
      
      // Increment scroll position
      container.scrollTop += scrollSpeed;

      // Check if we need to loop
      if (Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight) {
        // Calculate how much we overshot
        const overshoot = (container.scrollTop + container.clientHeight) - container.scrollHeight;
        // Set scroll to overshoot position from the top to create smooth transition
        container.scrollTop = overshoot;
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    // Start the scroll animation
    animationFrameId = requestAnimationFrame(scroll);

    // Handle hover pause/resume
    const handleMouseEnter = () => {
      scrolling = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };
    
    const handleMouseLeave = () => {
      scrolling = true;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(scroll);
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [polls.length, isScrollInitialized]);

  // Calculate vote statistics
  const getVoteStats = (choices: Choice[], votes: { choice_id: string }[]): ChoiceWithStats[] => {
    const total = votes.length;
    return choices.map(choice => {
      const choiceVotes = votes.filter(v => v.choice_id === choice.id).length;
      const percentage = total > 0 ? Math.round((choiceVotes / total) * 100) : 0;
      return {
        ...choice,
        votes: choiceVotes,
        percentage
      };
    });
  };

  // Share functionality
  const handleShareClick = (e: React.MouseEvent, poll: PollData) => {
    e.stopPropagation();
    setSelectedPoll(poll);
    setShowShareModal(true);
  };

  const getPollUrl = (pollId: string) => {
    return `${window.location.origin}/poll/${pollId}`;
  };

  const handleCopy = async () => {
    if (!selectedPoll) return;
    try {
      await navigator.clipboard.writeText(getPollUrl(selectedPoll.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy to clipboard");
    }
  };

  const handleCopyEmbed = async () => {
    if (!selectedPoll) return;
    try {
      const embedCode = `<iframe src="${getPollUrl(selectedPoll.id)}/embed" width="100%" height="500" frameborder="0" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>`;
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy embed code");
    }
  };

  const handleGoToPoll = () => {
    if (!selectedPoll) return;
    router.push(`/poll/${selectedPoll.id}`);
    setShowShareModal(false);
  };

  const shareOnTwitter = () => {
    if (!selectedPoll) return;
    const text = `Check out this poll: ${selectedPoll.question}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getPollUrl(selectedPoll.id))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    if (!selectedPoll) return;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPollUrl(selectedPoll.id))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    if (!selectedPoll) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPollUrl(selectedPoll.id))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareOnWhatsApp = () => {
    if (!selectedPoll) return;
    const text = `Check out this poll: ${selectedPoll.question} ${getPollUrl(selectedPoll.id)}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="h-full space-y-4 relative overflow-y-auto"
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        maskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)'
      }}
    >
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No active polls in the last 24 hours.</div>
      ) : (
        <div className="space-y-4 py-4 px-4">
          {polls.map((poll) => {
            const stats = getVoteStats(poll.choices || [], poll.votes || []);
            const timeAgo = new Date(poll.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            return (
              <div
                key={poll.id}
                role="button"
                tabIndex={0}
                className="rounded-lg bg-[#1e2736] border border-[#2f3a4e] hover:border-[#14b8a6]/50 hover:bg-[#1e2736]/80 p-4 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 relative"
                onClick={() => router.push(`/poll/${poll.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/poll/${poll.id}`);
                  }
                }}
              >
                

                {/* Poll Header */}
                <div className="mb-4 pr-10">
                  <h3 className="text-white text-2xl font-semibold mb-2 line-clamp-2">
                    {poll.question}
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* {poll.category && (
                      <span className="px-2 py-0.5 bg-teal-500 text-white rounded-full font-semibold text-xs">
                      {poll.category.name}
                      </span>
                    )} 
                    <span className="text-sm align-middle text-gray-500">
                      {(poll.votes || []).length} VOTES
                    </span>*/}
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {timeAgo}
                    </span>
                  </div>
                </div>

                {/* Poll Results */}
                <div className="space-y-3">
                  {stats.map(choice => (
                    <div key={choice.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300 truncate flex-1 mr-4">
                          {choice.text}
                        </span>
                        <span className="text-gray-400 flex-shrink-0">
                          {choice.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#151b26] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#14b8a6] transition-all duration-500 ease-out"
                          style={{ width: `${choice.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {/* Social Share Section */}
              <div className="mt-4 flex flex-row items-center justify-between h-10">
                
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5">
                  <ShareIcon className="h-4 w-4 text-[#14b8a6]" />
                  
                </div>
                  {/* Copy Link Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Copy direct link"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                  {/* Copy Embed Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopyEmbed(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Copy Embed Code"
                  >
                    <CodeBracketIcon className="w-4 h-4" />
                  </button>
                  {/* Twitter Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnTwitter(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  </button>
                  {/* Facebook Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnFacebook(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                  </button>
                  {/* LinkedIn Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnLinkedIn(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                  </button>
                  {/* WhatsApp Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnWhatsApp(); }}
                    className="p-1 text-gray-400 hover:text-gray-100 transition-colors"
                    aria-label="Share on WhatsApp"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM9.57 7.99c.19-.31.38-.41.5-.41.16 0 .35.05.48.28.13.23.78.94.78 1.13 0 .19-.09.38-.19.48-.09.1-.19.16-.33.28-.16.13-.35.23-.48.35-.16.13-.28.23-.41.43s-.28.41-.28.6c0 .19.09.38.19.48.1.1.23.19.35.23.16.05.71.33 1.36.91.84.74 1.36 1.03 1.58 1.13.23.1.35.09.48-.05.19-.16.55-.64.7-1.03.09-.23.19-.38.35-.38.13 0 .28-.05.41.05.13.1.43.55.5.64.09.1.13.19.13.28s-.05.38-.23.55c-.19.19-.78.74-1.1.88-.28.13-.55.19-.88.19-.23 0-.6-.09-1.13-1.03-.48-.88-1.03-1.45-1.58-1.93-.48-.41-1.03-.7-1.28-.83-.23-.13-.48-.19-.7-.19-.23 0-.43.05-.55.13-.13.09-.55.64-.71 1.03-.13.35-.28.55-.48.71-.16.13-.35.19-.55.19h-.13c-.28-.05-.71-.23-1.03-.74s-.64-1.13-.7-1.36c-.05-.23-.05-.41.05-.55.09-.13.23-.23.35-.31z" /></svg>
                  </button>
                </div>
              
                  <button 
                    className="h-8 rounded-md bg-[#151b26] border border-[#2f3a4e] text-[#14b8a6] font-medium hover:bg-[#14b8a6]/10 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 transform hover:scale-[1.02] px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/poll/${poll.id}`);
                    }}
                  >
                    <ChartBarBigIcon className="w-5 h-5 text-[#14b8a6]" />
                    Vote Now
                  </button>
                </div>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedPoll && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-[#1e2736] border border-[#2f3a4e] rounded-lg p-6 max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShareIcon className="w-5 h-5 text-[#14b8a6]" />
                Share Poll
              </h3>
              <button 
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                onClick={() => setShowShareModal(false)}
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Poll Link */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getPollUrl(selectedPoll.id)}
                  className="flex-1 h-10 px-3 rounded-md bg-[#151b26] border border-[#2f3a4e] text-white"
                />
                <button 
                  className="px-3 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] transition-colors flex items-center gap-1"
                  onClick={handleCopy}
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
                  className="px-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-1"
                  onClick={handleGoToPoll}
                  aria-label="Go to poll"
                >
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  <span className="text-xs">GO</span>
                </button>
              </div>

              {/* Embed Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`<iframe src="${getPollUrl(selectedPoll.id)}/embed" width="100%" height="500" frameborder="0" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>`}
                  className="flex-1 h-10 px-3 rounded-md bg-[#151b26] border border-[#2f3a4e] text-white text-sm"
                />
                <button 
                  className="px-3 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] transition-colors flex items-center gap-1"
                  onClick={handleCopyEmbed}
                  aria-label="Copy embed code"
                >
                  {embedCopied ? (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <CodeBracketIcon className="w-5 h-5" />
                      <span className="text-xs">EMBED</span>
                    </>
                  )}
                </button>
              </div>

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentPolls;
