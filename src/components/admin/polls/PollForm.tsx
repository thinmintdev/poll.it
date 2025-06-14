import { FC, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AdminSession, Category } from '@/types/admin';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollFormProps {
  session: AdminSession;
  categories: Category[];
  isLoading: boolean;
  onSuccess: () => void;
}

// Schema for poll form validation
const pollFormSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  visibility: z.enum(['public', 'private']),
  max_choices: z.coerce.number().int().min(1).max(8),
  category_id: z.string().uuid('Please select a valid category'),
  choices: z.array(z.string().min(1, 'Choice cannot be empty')).min(2, 'At least 2 choices required').max(8, 'Maximum 8 choices allowed')
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export const PollForm: FC<PollFormProps> = ({ 
  session, 
  categories, 
  isLoading, 
  onSuccess 
}) => {
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      question: '',
      visibility: 'public',
      max_choices: 1,
      category_id: '',
      choices: ['', ''] // Start with two empty choices
    }
  });

  const onSubmit = async (data: PollFormValues) => {
    setFormLoading(true);
    setError(null);

    try {
      // Add the user_id to the form data
      const pollData = {
        ...data,
        user_id: session.id
      };

      // Call the createPoll API
      const response = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(pollData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create poll');
      }

      // Reset form and notify parent of success
      form.reset({
        question: '',
        visibility: 'public',
        max_choices: 1,
        category_id: '',
        choices: ['', '']
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the poll');
      console.error('Poll creation error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const addChoice = () => {
    const currentChoices = form.getValues('choices');
    if (currentChoices.length < 8) {
      form.setValue('choices', [...currentChoices, '']);
    }
  };

  const removeChoice = (index: number) => {
    const currentChoices = form.getValues('choices');
    if (currentChoices.length > 2) {
      form.setValue('choices', currentChoices.filter((_, i) => i !== index));
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Fill out the form below to create a new poll
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input placeholder="What is your question?" {...field} />
                  </FormControl>
                  <FormDescription>
                    The main question of your poll
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Who can see this poll
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_choices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Choices</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={8} 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of choices a user can select
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category this poll belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <FormLabel>Poll Choices</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChoice}
                  disabled={form.getValues('choices').length >= 8}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Choice
                </Button>
              </div>
              <FormDescription className="mb-2">
                Add between 2 and 8 choices for your poll
              </FormDescription>

              <div className="space-y-2">
                {form.watch('choices').map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`choices.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1 mb-0">
                          <FormControl>
                            <Input placeholder={`Choice ${index + 1}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChoice(index)}
                      disabled={form.getValues('choices').length <= 2}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove choice</span>
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.choices && (
                <p className={cn("text-sm font-medium text-destructive mt-2")}>
                  {form.formState.errors.choices.message}
                </p>
              )}
            </div>

            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={formLoading}
              >
                {formLoading ? <LoadingSpinner size="sm" /> : 'Create Poll'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
