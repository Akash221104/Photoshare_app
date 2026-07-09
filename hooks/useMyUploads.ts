// hooks/useMyUploads.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Photo } from '@/types/photo';

export function useMyUploads(eventId: string) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const limit = 24;
  const isFirstLoad = useRef(true);

  const fetchUploads = useCallback(async (currentOffset: number, clearPrevious = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `/api/my/uploads?eventId=${eventId}&limit=${limit}&offset=${currentOffset}&sortBy=${sortBy}&query=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to retrieve uploads');
      }

      const data = await res.json();
      const newPhotos = data.photos || [];

      if (clearPrevious) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = newPhotos.filter((p: Photo) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
      }

      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while loading uploads');
    } finally {
      setLoading(false);
    }
  }, [eventId, sortBy, searchQuery]);

  // Trigger reload on query / sort changes
  useEffect(() => {
    setOffset(0);
    fetchUploads(0, true);
  }, [sortBy, searchQuery, fetchUploads]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchUploads(nextOffset, false);
  };

  const reload = () => {
    setOffset(0);
    fetchUploads(0, true);
  };

  return {
    photos,
    loading,
    error,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
    reload,
  };
}
