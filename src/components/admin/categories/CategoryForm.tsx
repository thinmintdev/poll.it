import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { categorySchema, CategoryFormValues } from '@/schemas/admin';

interface CategoryFormProps {
  isLoading: boolean;
  onSubmit: (name: string) => Promise<void>;
}

export const CategoryForm: FC<CategoryFormProps> = ({ isLoading, onSubmit }) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      await onSubmit(values.name);
      form.reset(); // Reset form on success
    } catch (error) {
      // Error handling is done in the parent component via the hook
      // Just let the error propagate
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Category</CardTitle>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Category'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
