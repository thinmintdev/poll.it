import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

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
    const interval = setInterval(fetchPolls, 30000);
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

  return (
    <div 
      ref={scrollContainerRef}
      className="h-[calc(100vh-280px)] max-h-[800px] space-y-4 relative overflow-y-auto"
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
                className="rounded-lg bg-[#1e2736] border border-[#2f3a4e] hover:border-[#14b8a6]/50 hover:bg-[#1e2736]/80 p-4 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
                onClick={() => router.push(`/poll/${poll.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/poll/${poll.id}`);
                  }
                }}
              >
                {/* Poll Header */}
                <div className="mb-4">
                  <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">
                    {poll.question}
                  </h3>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="inline-flex items-center rounded-full bg-[#14b8a6] px-2 py-0.5 text-xs font-medium text-[#14b8a6]">
                      LIVE
                    </span>
                    <span className="text-sm text-gray-400">
                      {(poll.votes || []).length} votes
                    </span>
                    <span className="text-sm text-gray-500">
                      Created {timeAgo}
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

                  <button 
                    className="w-full mt-4 h-10 rounded-md bg-[#151b26] border border-[#2f3a4e] text-[#14b8a6] font-medium hover:bg-[#14b8a6]/10 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/poll/${poll.id}`);
                    }}
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    Vote Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentPolls;
