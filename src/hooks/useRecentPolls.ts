import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface Choice {
  id: string;
  text: string;
}

export interface Category {
  id: string; // Assuming category has an ID
  name: string;
}

export interface Vote {
  choice_id: string;
  // Add other vote properties if any, e.g., user_id, created_at
}

export interface PollData {
  id: string;
  question: string;
  created_at: string;
  category_id: string | null; // Foreign key
  category: Category | null; // Populated relation
  choices: Choice[];
  votes: Vote[];
  visibility: 'public' | 'private' | 'unlisted'; // Assuming these are the possible values
  user_id: string; // Assuming polls are associated with a user
  // Add any other properties from your polls table
}

export interface ChoiceWithStats extends Choice {
  votes: number;
  percentage: number;
}

export interface UseRecentPollsReturn {
  polls: PollData[];
  loading: boolean;
  error: string | null;
  getVoteStats: (poll: PollData) => { voteStats: ChoiceWithStats[]; totalVotes: number };
}

export const useRecentPolls = (): UseRecentPollsReturn => {
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolls = useCallback(async () => {
    // setLoading(true); // Set loading true only on initial load or explicit refresh
    setError(null);
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data, error: supabaseError } = await supabase
        .from('polls')
        .select('*, category:categories(id, name), choices(id, text), votes(choice_id)')
        .eq('visibility', 'public')
        .gt('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }
      if (data) {
        setPolls(data as PollData[]);
      }
    } catch (e: any) {
      console.error('Error fetching polls:', e);
      setError(e.message || 'Failed to fetch polls.');
    } finally {
      setLoading(false); // Ensure loading is set to false after fetch attempt
    }
  }, []);

  useEffect(() => {
    setLoading(true); // Initial load
    fetchPolls();
    
    // Set up realtime subscriptions for polls, votes, and choices
    const pollsChannel = supabase
      .channel('recent-polls-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'polls' 
      }, (payload) => {
        console.log('Polls realtime update:', payload);
        fetchPolls(); // Refetch when polls change
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'votes' 
      }, (payload) => {
        console.log('Votes realtime update:', payload);
        fetchPolls(); // Refetch when votes change
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'choices' 
      }, (payload) => {
        console.log('Choices realtime update:', payload);
        fetchPolls(); // Refetch when choices change
      });

    pollsChannel.subscribe((status) => {
      console.log('Recent polls realtime status:', status);
    });

    // Also keep a backup polling mechanism but less frequent
    const interval = setInterval(fetchPolls, 60000); // Poll every 60 seconds as backup
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(pollsChannel);
    };
  }, [fetchPolls]);

  const getVoteStats = useCallback((poll: PollData): { voteStats: ChoiceWithStats[]; totalVotes: number } => {
    const votes = poll.votes || [];
    const choices = poll.choices || [];
    const totalVotes = votes.length;
    const voteStats = choices.map(choice => {
      const choiceVotes = votes.filter(v => v.choice_id === choice.id).length;
      const percentage = totalVotes > 0 ? Math.round((choiceVotes / totalVotes) * 100) : 0;
      return {
        ...choice,
        votes: choiceVotes,
        percentage,
      };
    });
    return { voteStats, totalVotes };
  }, []);

  return { polls, loading, error, getVoteStats };
};
