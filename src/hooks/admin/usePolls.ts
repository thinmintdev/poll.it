import { useCallback, useState, useEffect } from 'react';
import { AdminSession, Poll } from '@/types/admin';

interface CreatePollData {
  question: string;
  visibility: 'public' | 'private';
  max_choices: number;
  category_id: string;
  user_id: string;
  choices: string[];
}

interface UpdatePollData {
  question?: string;
  visibility?: 'public' | 'private';
  max_choices?: number;
  category_id?: string;
}

interface UsePolls {
  polls: Poll[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  fetchPolls: () => Promise<void>;
  createPoll: (data: CreatePollData) => Promise<void>;
  updatePoll: (id: string, data: UpdatePollData) => Promise<void>;
  deletePoll: (id: string) => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export function usePolls(session: AdminSession | null): UsePolls {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  const fetchPolls = useCallback(async () => {
    if (!session) {
      setError("Session not available for fetching polls.");
      setIsLoading(false);
      setPolls([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch("/api/admin/polls", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch polls' }));
        throw new Error(errorData.message || 'Failed to fetch polls');
      }
      
      const data = await res.json();
      setPolls(data.polls || []);
    } catch (err: any) {
      console.error("Error fetching polls:", err);
      setError(err.message || 'Failed to fetch polls');
      setPolls([]);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load polls when the session changes
  useEffect(() => {
    if (session) {
      fetchPolls();
    } else {
      setPolls([]);
      setIsLoading(false);
    }
  }, [session, fetchPolls]);

  const createPoll = async (data: CreatePollData) => {
    if (!session) {
      setError("Session not available for creating poll.");
      throw new Error("Session not available");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to create poll' }));
        throw new Error(errorData.message || 'Failed to create poll');
      }
      
      setSuccessMessage('Poll created successfully.');
      await fetchPolls(); // Refresh after creating
    } catch (err: any) {
      console.error("Error creating poll:", err);
      setError(err.message || 'Failed to create poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePoll = async (id: string, data: UpdatePollData) => {
    if (!session) {
      setError("Session not available for updating poll.");
      throw new Error("Session not available");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const res = await fetch("/api/admin/polls", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update poll' }));
        throw new Error(errorData.message || 'Failed to update poll');
      }
      
      setSuccessMessage('Poll updated successfully.');
      await fetchPolls(); // Refresh after updating
    } catch (err: any) {
      console.error("Error updating poll:", err);
      setError(err.message || 'Failed to update poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePoll = async (id: string) => {
    if (!session) {
      setError("Session not available for deleting poll.");
      throw new Error("Session not available");
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const res = await fetch("/api/admin/polls", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to delete poll' }));
        throw new Error(errorData.message || 'Failed to delete poll');
      }
      
      setSuccessMessage('Poll deleted successfully.');
      await fetchPolls(); // Refresh after deleting
    } catch (err: any) {
      console.error("Error deleting poll:", err);
      setError(err.message || 'Failed to delete poll');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    polls,
    isLoading,
    error,
    successMessage,
    fetchPolls,
    createPoll,
    updatePoll,
    deletePoll,
    clearError,
    clearSuccessMessage,
  };
}
