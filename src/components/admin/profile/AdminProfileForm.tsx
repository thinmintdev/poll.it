import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AdminProfile } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusAlert } from '@/components/admin/common/StatusAlert';

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  // Add other fields and validation rules as needed
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface AdminProfileFormProps {
  profile: AdminProfile | null;
  onUpdateProfile: (data: Partial<AdminProfile>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

const AdminProfileForm: React.FC<AdminProfileFormProps> = ({
  profile,
  onUpdateProfile,
  isLoading,
  error,
  successMessage,
  clearError,
  clearSuccessMessage,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || '',
      email: profile?.email || '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        email: profile.email,
      });
    }
  }, [profile, reset]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (data) => {
    clearError();
    clearSuccessMessage();
    try {
      await onUpdateProfile(data);
    } catch (updateError: any) {
      // Error is already set by the hook, but you could add specific handling here if needed
      console.error("Update profile error in form:", updateError);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Profile</CardTitle>
        <CardDescription>Update your administrator profile details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && <StatusAlert type="error" message={error} onClose={clearError} />}
          {successMessage && <StatusAlert type="success" message={successMessage} onClose={clearSuccessMessage} />}
          
          <div>
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register('username')} />
            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          {/* Add more profile fields here */}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AdminProfileForm;
