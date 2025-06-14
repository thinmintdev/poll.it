import dynamic from 'next/dynamic';
import { FC } from 'react';
import { AdminSession } from '@/types/admin';
import { PageSpinner } from './common/LoadingSpinner';

interface TabsProps {
  session: AdminSession;
}

const LoadingComponent = () => <PageSpinner />;

export const DynamicPollsTabs = dynamic<TabsProps>(
  () => import('./polls/PollsTabs'),
  { loading: LoadingComponent, ssr: false }
);

export const DynamicCategoriesTabs = dynamic<TabsProps>(
  () => import('./categories/CategoriesTabs'),
  { loading: LoadingComponent, ssr: false }
);

export const DynamicUsersTabs = dynamic<TabsProps>(
  () => import('./users/UsersTabs'),
  { loading: LoadingComponent, ssr: false }
);

export const DynamicProfileTabs = dynamic<TabsProps>(
  () => import('./profile/ProfileTabs'),
  { loading: LoadingComponent, ssr: false }
);
