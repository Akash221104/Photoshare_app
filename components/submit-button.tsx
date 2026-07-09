// components/submit-button.tsx
// Visual button that handles loading and submitting states.

import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './loading-spinner';

interface SubmitButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  loading?: boolean;
}

export function SubmitButton({ 
  loading = false, 
  children, 
  className, 
  disabled, 
  ...props 
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size={16} className="text-current" />
          Processing...
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
