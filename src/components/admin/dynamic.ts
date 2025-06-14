import dynamic from 'next/dynamic';
import { FC } from 'react';
import { AdminSession } from '@/types/admin';

interface TabsProps {
  session: AdminSession;
}

export const DynamicPollsTabs: FC<TabsProps> = dynamic(
  () => import('./polls/PollsTabs'),
  { 
    loading: () => import('./common/LoadingSpinner').then(mod => <mod.PageSpinner />),
    ssr: false 
  }
) as FC<TabsProps>;

export const DynamicCategoriesTabs: FC<TabsProps> = dynamic(
  () => import('./categories/CategoriesTabs'),
  { 
    loading: () => import('./common/LoadingSpinner').then(mod => <mod.PageSpinner />),
    ssr: false 
  }
) as FC<TabsProps>;
