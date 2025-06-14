import { useCallback, useState, useEffect } from 'react';
import { Category, AdminSession } from '@/types/admin';

interface UseCategories {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>; // Keep this if manual refresh is needed
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
  successMessage: string | null;
  clearSuccessMessage: () => void;
}

export const useCategories = (session: AdminSession | null): UseCategories => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!session) {
      setError("Session not available for fetching categories.");
      setIsLoading(false);
      setCategories([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch categories' }));
        throw new Error(errorData.message || 'Failed to fetch categories');
      }
      const data = await res.json();
      setCategories(data.categories || data); // Adjust based on API response structure
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while fetching categories.');
      setCategories([]); // Ensure categories is empty on error
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // useEffect to fetch categories on initial mount or when session changes
  useEffect(() => {
    if (session) { // Only fetch if session is available
      fetchCategories();
    } else {
      // Handle case where session is not yet available or becomes null
      setCategories([]);
      setIsLoading(false); // Not loading if no session
      // Optionally set an error or a specific state
      // setError("Admin session not found. Cannot load categories.");
    }
  }, [session, fetchCategories]); // Add fetchCategories to dependency array

  const createCategory = async (name: string) => {
    if (!session) {
      setError("Session not available for creating category.");
      throw new Error("Session not available");
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to create category' }));
        throw new Error(errorData.message || 'Failed to create category');
      }
      setSuccessMessage('Category created successfully.');
      await fetchCategories(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating category.');
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id: string, name: string) => {
    if (!session) {
      setError("Session not available for updating category.");
      throw new Error("Session not available");
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update category' }));
        throw new Error(errorData.message || 'Failed to update category');
      }
      setSuccessMessage('Category updated successfully.');
      await fetchCategories(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while updating category.');
      throw err; // Re-throw for form error handling
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!session) {
      setError("Session not available for deleting category.");
      throw new Error("Session not available");
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to delete category' }));
        throw new Error(errorData.message || 'Failed to delete category');
      }
      setSuccessMessage('Category deleted successfully.');
      await fetchCategories(); // Refresh list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while deleting category.');
      throw err; // Re-throw for potential UI feedback
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  return {
    categories,
    isLoading,
    error,
    fetchCategories, // Expose for manual refresh if needed
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    successMessage,
    clearSuccessMessage,
  };
};
