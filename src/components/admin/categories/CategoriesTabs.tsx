import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryList } from './CategoryList';
import { CategoryForm } from './CategoryForm';
import { StatusAlert } from '../common/StatusAlert';
import { AdminSession } from '@/types/admin';
import { useCategories } from '@/hooks/admin/useCategories';

interface CategoriesTabsProps {
  session: AdminSession;
}

const CategoriesTabs: FC<CategoriesTabsProps> = ({ session }) => {
  const {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories(session);

  return (
    <div className="space-y-6">
      <StatusAlert error={error} />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="add">Add Category</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CategoryList
            categories={categories}
            isLoading={isLoading}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        </TabsContent>

        <TabsContent value="add">
          <CategoryForm
            isLoading={isLoading}
            onSubmit={createCategory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoriesTabs;
