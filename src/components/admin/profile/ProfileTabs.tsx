import React from 'react';
import { useAdminProfile } from '@/hooks/admin/useAdminProfile';
import AdminProfileForm from './AdminProfileForm';
import { LoadingSpinner } from '@/components/admin/common/LoadingSpinner';
import { StatusAlert } from '@/components/admin/common/StatusAlert';

const ProfileTabs: React.FC = () => {
  const {
    profile,
    isLoading,
    error,
    successMessage,
    updateProfile,
    clearError,
    clearSuccessMessage,
  } = useAdminProfile();

  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  // Show general error if profile fetch failed, but still render form if profile exists (for update errors)
  if (error && !profile) {
    return <StatusAlert type="error" message={error} onClose={clearError} />;
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
