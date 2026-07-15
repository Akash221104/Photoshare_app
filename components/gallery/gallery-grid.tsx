// components/gallery/gallery-grid.tsx
// Renders the paginated event gallery grid. Supports lightbox and deletions.

'use client';

import React from 'react';
import { RefreshCw, ImageIcon } from 'lucide-react';

import { useGallery } from '@/hooks/useGallery';
import { PhotoCard } from './photo-card';
import { PhotoLightbox } from './photo-lightbox';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-spinner';
import { EmptyState } from '../events/empty-state';

interface GalleryGridProps {
  eventId: string;
  currentUserId: string;
  isHost: boolean;
}

export function GalleryGrid({ eventId, currentUserId, isHost }: GalleryGridProps) {
  const {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    reload,
    deletePhoto,
  } = useGallery(eventId);

  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this photo?')) return;
    const ok = await deletePhoto(photoId);
    if (ok && lightboxIndex !== null) {
      setLightboxIndex(null); // Close lightbox if open
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] space-y-4">
        <LoadingSpinner size={24} />
        <p className="text-xs text-zinc-500 font-medium">Loading gallery photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[250px] text-center space-y-4">
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <Button onClick={() => reload()} variant="outline" size="sm" className="gap-1.5">
          <RefreshCw size={14} />
          Retry
        </Button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <EmptyState
        title="No photos shared yet"
        description="Be the first to share a memory! Drag and drop files to start uploading."
      />
    );
  }

  const activeLightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="space-y-6">
      {/* Dynamic Count info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
        <span className="flex items-center gap-1.5">
          <ImageIcon size={14} />
          {total} Shared Photos
        </span>
      </div>

      {/* Masonry-style flex-row or CSS Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => {
          return (
            <PhotoCard
              key={photo.id}
              photo={photo}
              currentUserId={currentUserId}
              isHost={isHost}
              onPreview={() => setLightboxIndex(index)}
              onDelete={() => handleDelete(photo.id)}
              onStatusChange={reload}
            />
          );
        })}
      </div>

      {/* Load More controls */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full max-w-xs"
          >
            {loadingMore ? 'Loading more...' : 'Load More Photos'}
          </Button>
        </div>
      )}

      {/* Lightbox Preview */}
      {activeLightboxPhoto && (
        <PhotoLightbox
          photo={activeLightboxPhoto}
          onClose={() => setLightboxIndex(null)}
          onPrev={photos.length > 1 ? handlePrev : undefined}
          onNext={photos.length > 1 ? handleNext : undefined}
          onDelete={() => handleDelete(activeLightboxPhoto.id)}
          canDelete={isHost || activeLightboxPhoto.uploaded_by === currentUserId}
          currentIndex={lightboxIndex ?? undefined}
          totalCount={photos.length}
        />
      )}
    </div>
  );
}
