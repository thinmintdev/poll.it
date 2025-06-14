import { useState, useEffect, useCallback } from 'react';
import { User, AdminSession } from '@/types/admin';

interface UseUsersOptions {
  limit?: number;
  includeAdmins?: boolean;
}

export const useUsers = (
  session: AdminSession | null, // Allow session to be null initially
  options: UseUsersOptions = {}
) => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const limit = options.limit || 10;
  const includeAdmins = options.includeAdmins || false;

  const fetchUsers = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      setError("Session not available for fetching users.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Build query string with parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        includeAdmins: includeAdmins.toString()
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users.');
      setUsers([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [session, page, limit, search, includeAdmins]);

  useEffect(() => {
    if (session) { // Only fetch if session is available
        fetchUsers();
    }
  }, [fetchUsers, session]);

  const handleUserAction = async (
    action: () => Promise<Response>,
    successMsg: string,
    errorMsgPrefix: string
  ) => {
    if (!session) {
        setError("Session not available for this action.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await action();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Operation failed' }));
        throw new Error(errorData.message || 'Operation failed');
      }
      
      setSuccessMessage(successMsg);
      await fetchUsers(); // Refresh users list
    } catch (e: any) {
      setError(`${errorMsgPrefix}: ${e.message || 'Unknown error'}`);
      throw e; // Re-throw for component-level handling if needed
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    if (!session) {
      setError("Session not available for updating user.");
      return;
    }
    
    return handleUserAction(
      () => fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId, ...updates })
      }),
      'User updated successfully.',
      'Failed to update user'
    );
  };

  const banUser = async (userId: string) => {
    return updateUser(userId, { banned: true });
  };

  const unbanUser = async (userId: string) => {
    return updateUser(userId, { banned: false });
  };

  const promoteUser = async (userId: string) => {
    return updateUser(userId, { is_admin: true });
  };

  const demoteUser = async (userId: string) => {
    return updateUser(userId, { is_admin: false });
  };

  const deleteUser = async (userId: string) => {
    if (!session) {
      setError("Session not available for deleting user.");
      return;
    }
    
    return handleUserAction(
      () => fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id: userId })
      }),
      'User deleted successfully.',
      'Failed to delete user'
    );
  };

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  return {
    users,
    total,
    isLoading,
    error,
    successMessage,
    page,
    setPage,
    search,
    setSearch,
    fetchUsers,
    updateUser, // Export the updateUser function
    banUser,
    unbanUser,
    promoteUser,
    demoteUser,
    deleteUser,
    clearError,
    clearSuccessMessage,
    limit // Expose the limit so components can use it
  };
};
