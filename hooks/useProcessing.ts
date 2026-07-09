// hooks/useProcessing.ts
// React client hook to poll processing state for active photos and manage retry triggers.

import React from 'react';
import { toast } from 'sonner';
import { ProcessingStatus } from '@/types/embedding';

export function useProcessing(
  photoId: string,
  initialStatus: ProcessingStatus,
  onStatusChange?: () => void
) {
  const [status, setStatus] = React.useState<ProcessingStatus>(initialStatus);
  const [error, setError] = React.useState<string | null>(null);

  const isProcessing = status === ProcessingStatus.PENDING || status === ProcessingStatus.PROCESSING;

  const checkStatus = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/photos/${photoId}`);
      if (res.status === 401 || res.status === 403) {
        setStatus(ProcessingStatus.FAILED);
        setError('Session expired or unauthorized. Please sign in again.');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch photo status');
      }
      const data = await res.json();
      
      const newStatus = data.processing_status as ProcessingStatus;
      if (newStatus !== status) {
        setStatus(newStatus);
        if (newStatus === ProcessingStatus.FAILED) {
          setError(data.processing_error || 'Processing failed');
        } else {
          setError(null);
        }
        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (err: any) {
      console.error('Failed to poll photo status:', err.message);
    }
  }, [photoId, status, onStatusChange]);

  // Synchronize with external status updates (e.g. initial fetch)
  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  // Setup interval to poll active processing photos every 3 seconds
  React.useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      checkStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing, checkStatus]);

  /**
   * Invokes the retry API endpoint to retry a failed photo.
   */
  const retry = async () => {
    try {
      setStatus(ProcessingStatus.PENDING);
      setError(null);

      const res = await fetch(`/api/photos/${photoId}/retry`, {
        method: 'POST',
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to trigger retry');
      }

      toast.success('Processing retry triggered successfully');
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (err: any) {
      setStatus(ProcessingStatus.FAILED);
      setError(err.message);
      toast.error(err.message || 'Failed to retry photo processing');
    }
  };

  return {
    status,
    error,
    isProcessing,
    retry,
  };
}
