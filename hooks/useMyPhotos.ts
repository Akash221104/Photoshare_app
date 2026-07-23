// hooks/useMyPhotos.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { MatchedPhotoRow, PersonalGalleryStats } from '@/types/selfie';

export function useMyPhotos(eventId: string, initialThreshold = 0.40) {
  const [photos, setPhotos] = useState<MatchedPhotoRow[]>([]);
  const [stats, setStats] = useState<PersonalGalleryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'similarity' | 'newest' | 'oldest' | 'size'>('similarity');
  const [searchQuery, setSearchQuery] = useState<string>('');
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
        if (res.status === 401) {
          setStats(null);
          return;
        }
        throw new Error('Failed to load gallery stats');
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      // Quietly swallow unauthenticated error for guest visitors
    } finally {
      setLoadingStats(false);
    }
  }, [eventId, threshold]);

  const fetchPhotos = useCallback(async (currentOffset: number, clearPrevious = false, silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      
      const res = await fetch(
        `/api/my/photos?eventId=${eventId}&threshold=${threshold}&limit=${limit}&offset=${currentOffset}&sortBy=${sortBy}&query=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setPhotos([]);
          setHasMore(false);
          return;
        }
        throw new Error(errData.error || 'Failed to retrieve matched photos');
      }

      const data = await res.json();
      const newPhotos = data.photos || [];

      if (clearPrevious) {
        setPhotos(newPhotos);
      } else {
        setPhotos((prev) => {
          const existingIds = new Set(prev.map((p) => p.photo_id));
          const filtered = newPhotos.filter((p: MatchedPhotoRow) => !existingIds.has(p.photo_id));
          return [...prev, ...filtered];
        });
      }

      setHasMore(data.hasMore);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while loading matches');
    } finally {
      setLoading(false);
    }
  }, [eventId, threshold, sortBy, searchQuery]);

  // Trigger reload on query / sort / threshold changes
  useEffect(() => {
    setOffset(0);
    fetchPhotos(0, true);
    fetchStats();
  }, [sortBy, threshold, searchQuery, fetchPhotos, fetchStats]);

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchPhotos(nextOffset, false);
  };

  const reload = (silent = false) => {
    setOffset(0);
    fetchPhotos(0, true, silent);
    fetchStats();
  };

  // Listen for background AI updates to auto-refresh matched photos
  useEffect(() => {
    const handleUpdate = () => {
      reload(true);
    };
    window.addEventListener('gallery-update', handleUpdate);
    return () => window.removeEventListener('gallery-update', handleUpdate);
  }, [reload]);

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
    searchQuery,
    setSearchQuery,
    hasMore,
    loadMore,
    reload,
  };
}
