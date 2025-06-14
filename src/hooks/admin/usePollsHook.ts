import { useState, useEffect, useCallback } from 'react';
import { AdminSession, Poll } from '@/types/admin';

/**
 * Interface for creating a poll
 */
interface CreatePollData {
  question: string;
  visibility: 'public' | 'private';
  max_choices: number;
  category_id: string;
  user_id: string;
  choices: string[];
}

/**
 * Interface for updating a poll
 */
interface UpdatePollData {
  question?: string;
  visibility?: 'public' | 'private';
  max_choices?: number;
  category_id?: string;
}

/**
 * Hook for managing polls in the admin panel
 */
function usePollsHook(session: AdminSession | null) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

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

  const createPoll = useCallback(async (data: CreatePollData) => {
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
  }, [session, fetchPolls]);

  const updatePoll = useCallback(async (id: string, data: UpdatePollData) => {
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
  }, [session, fetchPolls]);

  const deletePoll = useCallback(async (id: string) => {
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
  }, [session, fetchPolls]);

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

// Export both named and default export
export { usePollsHook as usePolls };
export default usePollsHook;
