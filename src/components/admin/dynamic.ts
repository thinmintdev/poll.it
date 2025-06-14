import dynamic from 'next/dynamic';
import type { FC } from 'react';
import type { AdminSession } from '@/types/admin';

interface TabsProps {
  session: AdminSession;
}

// Create a type-safe function for dynamic imports
function createDynamicComponent<T>(importFunc: () => Promise<{ default: FC<T> }>) {
  return dynamic(importFunc, { 
    loading: () => null,
    ssr: false 
  });
}

export const DynamicPollsTabs = createDynamicComponent<TabsProps>(
  () => import('./polls/PollsTabs')
);

export const DynamicCategoriesTabs = createDynamicComponent<TabsProps>(
  () => import('./categories/CategoriesTabs')
);

export const DynamicUsersTabs = createDynamicComponent<TabsProps>(
  () => import('./users/UsersTabs')
);

export const DynamicProfileTabs = createDynamicComponent<TabsProps>(
  () => import('./profile/ProfileTabs')
);
