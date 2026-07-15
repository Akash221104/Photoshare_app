// hooks/useGallery.ts
// Client hook to fetch paginated gallery items, handle infinite scroll, and trigger deletions.

import React from 'react';
import { toast } from 'sonner';
import { Photo } from '@/types/photo';

export function useGallery(eventId: string, limit = 12) {
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  const fetchPhotos = React.useCallback(
    async (currentOffset: number, append = false, silent = false) => {
      if (!eventId) return;
      if (append) {
        setLoadingMore(true);
      } else if (!silent) {
        setLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(`/api/events/${eventId}/photos?limit=${limit}&offset=${currentOffset}`);
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || 'Failed to fetch photos');
        }
        const data = await res.json();

        setPhotos((prev) => (append ? [...prev, ...data.photos] : data.photos));
        setTotal(data.total);
        setHasMore(data.hasMore);
        setOffset(currentOffset);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading photos');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [eventId, limit]
  );

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextOffset = offset + limit;
    fetchPhotos(nextOffset, true);
  };

  const reload = (silent = false) => {
    fetchPhotos(0, false, silent);
  };

  const deletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to delete photo');
      }
      toast.success('Photo deleted successfully');
      // Update local grid state
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setTotal((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete photo');
      return false;
    }
  };

  React.useEffect(() => {
    if (eventId) {
      fetchPhotos(0, false);
    }
  }, [eventId, fetchPhotos]);

  // Listen for background AI updates to auto-refresh event gallery photos
  React.useEffect(() => {
    const handleUpdate = () => {
      reload(true);
    };
    window.addEventListener('gallery-update', handleUpdate);
    return () => window.removeEventListener('gallery-update', handleUpdate);
  }, [reload]);

  return {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    reload,
    deletePhoto,
  };
}
