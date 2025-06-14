import React from 'react';
import { useAdminProfile } from '@/hooks/admin/useAdminProfile';
import AdminProfileForm from './AdminProfileForm';
import { LoadingSpinner } from '@/components/admin/common/LoadingSpinner';
import { StatusAlert } from '@/components/admin/common/StatusAlert';
import { AdminSession } from '@/types/admin';

interface ProfileTabsProps {
  session: AdminSession;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ session }) => {
  const {
    profile,
    isLoading,
    error,
    successMessage,
    updateProfile,
    clearError,
    clearSuccessMessage,
  } = useAdminProfile(session);

  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  // Show general error if profile fetch failed, but still render form if profile exists (for update errors)
  if (error && !profile) {
    return <StatusAlert error={error} onClose={clearError} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      <AdminProfileForm
        profile={profile}
        onUpdateProfile={updateProfile}
        isLoading={isLoading} // This now reflects update loading state
        error={error} // This reflects fetch or update error
        successMessage={successMessage}
        clearError={clearError}
        clearSuccessMessage={clearSuccessMessage}
      />
    </div>
  );
};

export default ProfileTabs;
