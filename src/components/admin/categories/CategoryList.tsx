import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/admin';
import { LoadingSpinner } from '@/components/admin/common/LoadingSpinner';
import { CategoryEditForm } from './CategoryEditForm';
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
import { Pencil, Trash2 } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CategoryList: FC<CategoryListProps> = ({ 
  categories, 
  isLoading, 
  onUpdate, 
  onDelete 
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
  };
  
  const handleDelete = async () => {
    if (categoryToDelete) {
      await onDelete(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  if (editingCategory) {
    return (
      <CategoryEditForm
        category={editingCategory}
        isLoading={isLoading}
        onSubmit={onUpdate}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (isLoading && categories.length === 0) {
    return <LoadingSpinner />;
  }

  if (!isLoading && categories.length === 0) {
    return <p>No categories found. You can add new ones in the &quot;Add Category&quot; tab.</p>;
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <CardTitle className="text-lg font-medium">{category.name}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => confirmDelete(category)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the category &quot;{categoryToDelete?.name}&quot;.
                      If any polls are using this category, the operation will fail.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
