// hooks/useSelfie.ts
import { useState, useEffect, useCallback } from 'react';

export function useSelfie(eventId: string) {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSelfie = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/selfie?eventId=${eventId}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve selfie metadata');
      }
      const data = await res.json();
      setSelfieUrl(data?.cloudinary_url || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load selfie');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const uploadSelfie = useCallback(async (base64Image: string) => {
    try {
      setUploading(true);
      setError(null);
      const res = await fetch('/api/selfie/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          image: base64Image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload selfie');
      }

      setSelfieUrl(data.cloudinary_url);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to upload selfie');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [eventId]);

  const deleteSelfie = useCallback(async () => {
    try {
      setDeleting(true);
      setError(null);
      const res = await fetch(`/api/selfie?eventId=${eventId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete selfie');
      }
      setSelfieUrl(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete selfie');
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSelfie();
  }, [fetchSelfie]);

  return {
    selfieUrl,
    loading,
    uploading,
    deleting,
    error,
    uploadSelfie,
    deleteSelfie,
    refreshSelfie: fetchSelfie,
  };
}
