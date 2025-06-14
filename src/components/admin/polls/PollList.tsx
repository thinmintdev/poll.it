import { FC, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category, Poll } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PollListProps {
  polls: Poll[];
  categories: Category[];
  isLoading: boolean;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const PollList: FC<PollListProps> = ({
  polls,
  categories,
  isLoading,
  onUpdate,
  onDelete,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No polls found. Create a new poll to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <Card key={poll.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{poll.question}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getCategoryName(poll.category_id)}
                    </Badge>
                    <Badge
                      variant={
                        poll.visibility === 'public'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {poll.visibility}
                    </Badge>
                  </div>
                  <p>
                    Created by: {poll.profiles?.username || 'Unknown User'}
                  </p>
                  <p>Max choices: {poll.max_choices}</p>
                  <p>Created: {formatDate(poll.created_at)}</p>
                  {poll.expires_at && (
                    <p>Expires: {formatDate(poll.expires_at)}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Implement edit functionality
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteConfirmation(poll.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <AlertDialog
        open={!!deleteConfirmation}
        onOpenChange={() => setDeleteConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poll
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteConfirmation) {
                  await onDelete(deleteConfirmation);
                  setDeleteConfirmation(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
