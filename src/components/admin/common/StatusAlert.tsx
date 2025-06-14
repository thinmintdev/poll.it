import { FC } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusAlertProps {
  error?: string | null;
  success?: string | null;
  className?: string;
  onClose?: () => void;
  // For backward compatibility with existing code
  type?: 'error' | 'success';
  message?: string;
}

export const StatusAlert: FC<StatusAlertProps> = ({ 
  error, 
  success, 
  className, 
  onClose,
  type,
  message
}) => {
  // Handle both new and old API
  const errorMessage = error || (type === 'error' ? message : null);
  const successMessage = success || (type === 'success' ? message : null);

  if (!errorMessage && !successMessage) return null;

  return (
    <Alert
      variant={errorMessage ? "destructive" : undefined}
      className={cn(
        "mb-4 relative",
        successMessage && "border-green-500 text-green-500",
        className
      )}
    >
      <AlertDescription>{errorMessage || successMessage}</AlertDescription>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </Alert>
  );
};
