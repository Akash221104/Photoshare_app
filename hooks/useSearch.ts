// hooks/useSearch.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchedPhotoRow, PersonalGalleryStats } from '@/types/selfie';

export function useSearch(eventId: string, initialThreshold = 0.40) {
  const [photos, setPhotos] = useState<MatchedPhotoRow[]>([]);
  const [stats, setStats] = useState<PersonalGalleryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'similarity' | 'date' | 'photographer'>('similarity');
  const [threshold, setThreshold] = useState<number>(initialThreshold);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const limit = 24;
  const isFirstLoad = useRef(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`/api/gallery/me/stats?eventId=${eventId}&threshold=${threshold}`);
      if (!res.ok) {
        throw new Error('Failed to load gallery stats');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  }, [eventId, threshold]);

  const fetchPhotos = useCallback(async (currentOffset: number, clearPrevious = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `/api/gallery/me?eventId=${eventId}&threshold=${threshold}&limit=${limit}&offset=${currentOffset}&sortBy=${sortBy}`
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to retrieve matched photos');
      }

      const data = await res.json();
      const newPhotos = data.photos || [];

      if (clearPrevious) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => {
          // Prevent duplicates by checking photo_id
          const existingIds = new Set(prev.map((p) => p.photo_id));
          const filtered = newPhotos.filter((p: MatchedPhotoRow) => !existingIds.has(p.photo_id));
          return [...prev, ...filtered];
        });
      }

      setHasMore(newPhotos.length === limit);
    } catch (err: any) {
      setError(err.message || 'An error occurred during search execution');
    } finally {
      setLoading(false);
    }
  }, [eventId, threshold, sortBy, limit]);

  // Reset and reload on threshold or sort changes
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    setOffset(0);
    setHasMore(true);
    fetchPhotos(0, true);
    fetchStats();
  }, [threshold, sortBy, fetchPhotos, fetchStats]);

  // Initial load
  useEffect(() => {
    setPhotos([]);
    setOffset(0);
    setHasMore(true);
    fetchPhotos(0, true);
    fetchStats();
  }, [eventId]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchPhotos(nextOffset, false);
  }, [loading, hasMore, offset, limit, fetchPhotos]);

  const triggerSearch = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchPhotos(0, true);
    fetchStats();
  }, [fetchPhotos, fetchStats]);

  return {
    photos,
    stats,
    loading,
    loadingStats,
    error,
    sortBy,
    setSortBy,
    threshold,
    setThreshold,
    hasMore,
    loadMore,
    triggerSearch,
    refreshStats: fetchStats,
  };
}
