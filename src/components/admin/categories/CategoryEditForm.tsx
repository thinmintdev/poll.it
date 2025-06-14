import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category } from '@/types/admin';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { categorySchema, CategoryFormValues } from '@/schemas/admin';

interface CategoryEditFormProps {
  category: Category;
  isLoading: boolean;
  onSubmit: (id: string, name: string) => Promise<void>;
  onCancel: () => void;
}

export const CategoryEditForm: FC<CategoryEditFormProps> = ({ 
  category, 
  isLoading, 
  onSubmit, 
  onCancel 
}) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      await onSubmit(category.id, values.name);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
