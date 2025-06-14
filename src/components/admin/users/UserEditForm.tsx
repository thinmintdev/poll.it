import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { userUpdateSchema } from '@/schemas/admin';

interface UserEditFormProps {
  user: User;
  isLoading: boolean;
  onSubmit: (userId: string, updates: Partial<User>) => Promise<void>;
  onCancel: () => void;
  isAdmin?: boolean; // To control admin-only fields
}

export const UserEditForm: FC<UserEditFormProps> = ({ 
  user, 
  isLoading, 
  onSubmit, 
  onCancel,
  isAdmin = false 
}) => {
  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      id: user.id,
      username: user.username,
      display_name: user.display_name || '',
      avatar_url: user.avatar_url || '',
      bio: user.bio || '',
      is_admin: user.is_admin,
      banned: user.banned
    }
  });

  const handleSubmit = async (values: any) => {
    const { id, ...updates } = values;
    try {
      await onSubmit(id, updates);
    } catch (error) {
      // Error will be handled by the hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User: {user.username}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter avatar URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter user bio" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isAdmin && (
              <>
                <FormField
                  control={form.control}
                  name="is_admin"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Admin Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Toggle to grant or revoke admin privileges
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="banned"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Ban Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Toggle to ban or unban this user
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
