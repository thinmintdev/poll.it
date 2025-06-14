import { FC, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PollList } from './PollList';
import { PollForm } from './PollForm';
import { StatusAlert } from '../common/StatusAlert';
import { AdminSession } from '@/types/admin';
import { usePolls } from '@/hooks/admin/usePollsHook';
import { useCategories } from '@/hooks/admin/useCategories';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PollsTabsProps {
  session: AdminSession;
}

const PollsTabs: FC<PollsTabsProps> = ({ session }) => {
  const {
    polls,
    isLoading: pollsLoading,
    error: pollsError,
    fetchPolls,
    updatePoll,
    deletePoll,
    createPoll,
  } = usePolls(session);

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
  } = useCategories(session);

  // Fetch polls and categories when component mounts
  useEffect(() => {
    fetchPolls();
    fetchCategories();
  }, [fetchPolls, fetchCategories]);

  const handlePollSuccess = () => {
    fetchPolls();
  };

  return (
    <div className="space-y-6">
      <StatusAlert error={pollsError || categoriesError} />
      
      {(pollsLoading && polls.length === 0) ? (
        <LoadingSpinner />
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Polls</TabsTrigger>
            <TabsTrigger value="add">Add Poll</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <PollList
              polls={polls}
              categories={categories}
              isLoading={pollsLoading}
              onUpdate={updatePoll}
              onDelete={deletePoll}
            />
          </TabsContent>

          <TabsContent value="add">
            <PollForm
              session={session}
              categories={categories}
              isLoading={categoriesLoading}
              onSuccess={handlePollSuccess}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default PollsTabs;
