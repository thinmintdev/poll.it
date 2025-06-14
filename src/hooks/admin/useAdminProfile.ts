import { useState, useEffect, useCallback } from 'react';
import { AdminProfile, AdminSession } from '@/types/admin';

// API functions that use the session token
const fetchAdminProfileAPI = async (token: string): Promise<AdminProfile> => {
  // In a real implementation, this would use the token to authenticate the API request
  console.log('Using token for profile fetch:', token);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'admin001',
        username: 'AdminUser',
        email: 'admin@example.com',
        is_admin: true,
        banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 500);
  });
};

const updateAdminProfileAPI = async (token: string, profileData: Partial<AdminProfile>): Promise<AdminProfile> => {
  // In a real implementation, this would use the token to authenticate the API request
  console.log('Using token for profile update:', token);
  
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
          // Ensure required fields are set with correct values
          is_admin: profileData.is_admin !== undefined ? profileData.is_admin : true,
          banned: profileData.banned !== undefined ? profileData.banned : false,
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }, 500);
  });
};

export const useAdminProfile = (session: AdminSession) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await fetchAdminProfileAPI(session.access_token);
      setProfile(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  }, [session.access_token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updatedData: Partial<AdminProfile>) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const updatedProfile = await updateAdminProfileAPI(session.access_token, { ...profile, ...updatedData });
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
