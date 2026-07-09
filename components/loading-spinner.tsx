// components/loading-spinner.tsx
// Reusable loading spinner component.

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 20 }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn('animate-spin text-zinc-500 dark:text-zinc-400', className)} 
      size={size} 
    />
  );
}
