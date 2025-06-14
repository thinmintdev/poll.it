import React, { useState } from 'react';
import { User } from '@/types/admin';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/admin/common/LoadingSpinner';
import { UserEditForm } from './UserEditForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Ban, UserCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onBan: (userId: string) => Promise<void>;
  onUnban: (userId: string) => Promise<void>;
  onPromote?: (userId: string) => Promise<void>;
  onDemote?: (userId: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onUpdate: (userId: string, updates: Partial<User>) => Promise<void>;
  
  // Pagination and Search props
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  limit?: number; // Optional: to calculate total pages

  // Granular button visibility
  showPromoteButton?: boolean;
  showDemoteButton?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  error,
  onBan,
  onUnban,
  onPromote,
  onDemote,
  onDelete,
  onUpdate,
  total,
  page,
  onPageChange,
  search,
  onSearchChange,
  limit = 10, // Default limit for page calculation
  showPromoteButton = true, // Default to true
  showDemoteButton = true,  // Default to true
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const totalPages = Math.ceil(total / limit);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdate = async (userId: string, updates: Partial<User>) => {
    await onUpdate(userId, updates);
    setEditingUser(null);
  };
  
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
  };
  
  const handleDelete = async () => {
    if (userToDelete) {
      await onDelete(userToDelete.id);
      setUserToDelete(null);
    }
  };

  if (editingUser) {
    return (
      <UserEditForm
        user={editingUser}
        isLoading={isLoading}
        onSubmit={handleUpdate}
        onCancel={handleCancelEdit}
        isAdmin={true} // Assuming this component is only visible to admins
      />
    );
  }

  if (isLoading && users.length === 0) { // Show prominent loading only if no users are displayed yet
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-4">Error loading users: {error}</p>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users by username, email or display name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      {isLoading && <p className="text-sm text-gray-500">Updating user list...</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                    {user.is_admin ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.banned ? 'destructive' : 'outline'}>
                    {user.banned ? 'Banned' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button onClick={() => handleEdit(user)} variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  {user.banned ? (
                    <Button onClick={() => onUnban(user.id)} variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Unban
                    </Button>
                  ) : (
                    <Button onClick={() => onBan(user.id)} variant="destructive" size="sm">
                      <Ban className="h-4 w-4 mr-1" />
                      Ban
                    </Button>
                  )}
                  
                  {showPromoteButton && !user.is_admin && onPromote && (
                    <Button onClick={() => onPromote(user.id)} variant="default" size="sm">
                      <ShieldAlert className="h-4 w-4 mr-1" />
                      Promote
                    </Button>
                  )}
                  
                  {showDemoteButton && user.is_admin && onDemote && (
                    <Button onClick={() => onDemote(user.id)} variant="secondary" size="sm">
                      <ShieldX className="h-4 w-4 mr-1" />
                      Demote
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => confirmDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the user &quot;{userToDelete?.username}&quot;. 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {total > 0 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-700">
            Showing page {page} of {totalPages} ({total} users)
          </p>
          <div className="space-x-2">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// export default UserList; // Ensuring named export as per usage
