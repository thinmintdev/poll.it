import { FC } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-16 w-16'
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  className,
  size = 'md'
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2 border-primary',
        sizes[size],
        className
      )}
    />
  );
};

export const PageSpinner: FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);
