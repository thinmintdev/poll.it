import { useState, useEffect, useCallback } from 'react';
import { AdminProfile } from '@/types/admin';

// Mock API functions (replace with actual API calls)
const fetchAdminProfileAPI = async (): Promise<AdminProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'admin001',
        username: 'AdminUser',
        email: 'admin@example.com',
        // Add other profile fields as needed
      });
    }, 500);
  });
};

const updateAdminProfileAPI = async (profileData: Partial<AdminProfile>): Promise<AdminProfile> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (profileData.email === 'error@example.com') {
        reject(new Error('Failed to update profile. Invalid email.'));
      } else {
        console.log('Updating profile with:', profileData);
        resolve({ 
          id: 'admin001', 
          username: profileData.username || 'AdminUser', 
          email: profileData.email || 'admin@example.com', 
          ...profileData 
        });
      }
    }, 500);
  });
};

export const useAdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await fetchAdminProfileAPI();
      setProfile(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updatedData: Partial<AdminProfile>) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedProfile = await updateAdminProfileAPI({ ...profile, ...updatedData });
      setProfile(updatedProfile);
      setSuccessMessage('Profile updated successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to update profile.');
      throw e; // Re-throw to allow form to handle it
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);

  return {
    profile,
    isLoading,
    error,
    successMessage,
    fetchProfile,
    updateProfile,
    clearError,
    clearSuccessMessage,
  };
};
