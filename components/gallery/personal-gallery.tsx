// components/gallery/personal-gallery.tsx
'use client';

import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, Calendar, User, Sparkles, ZoomIn, Info, Check, CheckSquare, Square, Download, Trash2, LayoutGrid, Grid2X2, Grid3x3 } from 'lucide-react';
import { toast } from 'sonner';
import { MatchedPhotoRow, PersonalGalleryStats } from '@/types/selfie';
import { Photo } from '@/types/photo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoLightbox } from './photo-lightbox';
import { LoadingSpinner } from '@/components/loading-spinner';
import { GallerySkeleton, StatsSkeleton } from './gallery-skeleton';

interface PersonalGalleryProps {
  photos: any[]; // Supports both MatchedPhotoRow (AI Matches) and Photo (Own Uploads)
  stats: PersonalGalleryStats | null;
  loading: boolean;
  loadingStats: boolean;
  error: string | null;
  sortBy: string;
  setSortBy: (val: any) => void;
  threshold?: number;
  setThreshold?: (val: number) => void;
  hasMore: boolean;
  loadMore: () => void;
  onRefresh: () => void;

  // Selection system props
  selectedPhotoIds: string[];
  toggleSelectPhoto: (photoId: string) => void;
  selectAllPhotos: () => void;
  clearSelection: () => void;

  // Gallery Type
  type: 'uploads' | 'matches';
}

export function PersonalGallery({
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
  onRefresh,
  selectedPhotoIds,
  toggleSelectPhoto,
  selectAllPhotos,
  clearSelection,
  type,
}: PersonalGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [gridDensity, setGridDensity] = useState<'small' | 'medium' | 'large'>('medium');
  const [deleting, setDeleting] = useState<boolean>(false);

  // Normalize list to Photo[] structure for lightbox preview
  const getMappedPhotosForLightbox = (): Photo[] => {
    return photos.map((p) => {
      const isMatch = type === 'matches';
      return {
        id: isMatch ? p.photo_id : p.id,
        event_id: p.event_id,
        uploaded_by: p.uploaded_by,
        uploader_name: isMatch ? p.uploader_name : (p.uploader_name || 'Me'),
        cloudinary_public_id: p.cloudinary_public_id,
        cloudinary_url: p.cloudinary_url,
        width: p.width,
        height: p.height,
        status: 'processed',
        processing_status: 'COMPLETED',
        created_at: isMatch ? p.photo_created_at : p.created_at,
        updated_at: isMatch ? p.photo_created_at : p.updated_at,
      };
    }) as unknown as Photo[];
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const handleIndividualDownload = async (photo: any) => {
    const url = photo.cloudinary_url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const photoId = type === 'matches' ? photo.photo_id : photo.id;
      link.download = `photo-${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const handleSingleDelete = async (photoId: string) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete photo');
      }
      toast.success('Photo deleted successfully');
      onRefresh();
      if (lightboxIndex !== null) setLightboxIndex(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPhotoIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedPhotoIds.length} selected photos?`)) return;
    try {
      setDeleting(true);
      let successCount = 0;
      for (const id of selectedPhotoIds) {
        const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        if (res.ok) successCount++;
      }
      toast.success(`Successfully deleted ${successCount} photos`);
      clearSelection();
      onRefresh();
    } catch (err: any) {
      toast.error('Error deleting selected photos');
    } finally {
      setDeleting(false);
    }
  };

  const allSelected = photos.length > 0 && selectedPhotoIds.length === photos.length;

  const gridClasses = {
    small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3',
    large: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5',
  }[gridDensity];

  return (
    <div className="space-y-6">
      
      {/* 2. Controls Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[rgba(255,170,80,0.2)] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-extrabold text-[#1A1A1A]">
            {type === 'matches' ? 'Your Matched Photos' : 'Your Uploaded Photos'}
          </span>
          <span className="text-xs font-bold text-[#FB8500] bg-[#FFF8F2] px-2.5 py-0.5 rounded-full border border-[rgba(255,170,80,0.3)]">
            {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
          </span>
        </div>

        {/* Selection Controls, Grid Density & Sorters */}
        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
          {/* Grid View Density Switcher */}
          <div className="flex items-center gap-1 bg-[#FFF8F2] border border-[rgba(255,170,80,0.3)] p-1 rounded-xl">
            <button
              onClick={() => setGridDensity('small')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                gridDensity === 'small' ? 'bg-[#FB8500] text-white shadow-xs' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
              }`}
              title="Small Compact Grid"
            >
              <Grid3x3 size={15} />
            </button>
            <button
              onClick={() => setGridDensity('medium')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                gridDensity === 'medium' ? 'bg-[#FB8500] text-white shadow-xs' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
              }`}
              title="Medium Standard Grid"
            >
              <Grid2X2 size={15} />
            </button>
            <button
              onClick={() => setGridDensity('large')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                gridDensity === 'large' ? 'bg-[#FB8500] text-white shadow-xs' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
              }`}
              title="Large Preview Grid"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Selection & Bulk Delete Actions */}
          {photos.length > 0 && (
            <div className="flex items-center gap-1.5 bg-zinc-50 rounded-xl p-1 border border-zinc-200">
              <Button
                size="sm"
                variant="ghost"
                onClick={allSelected ? clearSelection : selectAllPhotos}
                className="text-xs px-2.5 h-8 gap-1.5 font-bold"
              >
                {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-[#FB8500]" /> : <Square className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
              </Button>

              {selectedPhotoIds.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="text-xs px-3 h-8 gap-1.5 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
                >
                  <Trash2 size={13} />
                  <span>Delete ({selectedPhotoIds.length})</span>
                </Button>
              )}
            </div>
          )}

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-semibold whitespace-nowrap">Sort:</span>
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[140px] h-8 bg-white border border-zinc-200 text-xs rounded-xl font-bold">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {type === 'matches' && <SelectItem value="similarity">Best Match</SelectItem>}
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="size">File Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 3. Error Alert */}
      {error && (
        <Card className="border border-red-500/20 bg-red-500/5 p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h4 className="font-semibold text-sm">Query Failed</h4>
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button onClick={onRefresh} variant="outline" size="sm" className="mt-2 gap-1 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Query
            </Button>
          </div>
        </Card>
      )}

      {/* 4. Match Gallery Grid */}
      {loading && photos.length === 0 ? (
        <GallerySkeleton />
      ) : photos.length === 0 ? (
        <div className="bg-gradient-to-b from-[#FFFDF8] to-[#FFF8F2] border-2 border-dashed border-[#FB8500]/25 rounded-[32px] p-10 sm:p-14 text-center shadow-xs">
          <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-lg shadow-[#FB8500]/20 animate-float-slow">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="font-serif-display font-bold text-xl text-[#1A1A1A]">No Photos Found</h4>
            <p className="text-xs text-[#525252] leading-relaxed">
              {type === 'matches'
                ? "We couldn't spot your face matching the current threshold. Try dragging the Sensitivity slider left to adjust detection precision."
                : "You haven't uploaded any photos to this event gallery yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`grid ${gridClasses}`}>
            {photos.map((photo, index) => {
              const photoId = type === 'matches' ? photo.photo_id : photo.id;
              const isSelected = selectedPhotoIds.includes(photoId);
              const formattedDate = formatDate(type === 'matches' ? photo.photo_created_at : photo.created_at);

              return (
                <Card
                  key={photoId}
                  onClick={() => toggleSelectPhoto(photoId)}
                  className={`group relative overflow-hidden border bg-card hover:shadow-md transition-all duration-300 rounded-2xl sm:rounded-3xl aspect-square sm:aspect-[4/3] cursor-pointer select-none ${
                    isSelected ? 'ring-2 ring-[#FB8500] border-[#FB8500] bg-[#FB8500]/5' : 'border-zinc-200'
                  }`}
                >
                  {/* Photo Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.cloudinary_url}
                    alt="Gallery item"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    loading="lazy"
                  />

                  {/* Top-Left Selection Checkbox */}
                  <div className={`absolute top-2.5 left-2.5 z-20 transition-all ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border shadow backdrop-blur-sm transition-all ${
                      isSelected ? 'bg-[#FB8500] border-[#FB8500] text-white' : 'bg-black/40 border-white/40 text-transparent hover:border-white'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Top-Right Badges */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 items-end">
                    {/* Similarity Badge */}
                    {type === 'matches' && (
                      <span className="bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" />
                        {(photo.similarity * 100).toFixed(0)}% Match
                      </span>
                    )}

                    {/* Image Resolution */}
                    <span className="bg-black/60 backdrop-blur-sm text-zinc-300 text-[8px] font-mono px-1.5 py-0.5 rounded shadow">
                      {photo.width} × {photo.height}
                    </span>
                  </div>

                  {/* Hover Overlay controls */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 z-10" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center text-white">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-semibold flex items-center gap-1 drop-shadow">
                          <User size={10} className="opacity-80" />
                          {type === 'matches' ? photo.uploader_name : 'Me'}
                        </p>
                        <p className="text-[9px] flex items-center gap-1 opacity-85 drop-shadow">
                          <Calendar size={9} />
                          {formattedDate}
                        </p>
                      </div>

                      <div className="flex gap-1.5">
                        {/* Single Delete Photo */}
                        {type === 'uploads' && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 bg-rose-500/30 hover:bg-rose-500/50 border-transparent backdrop-blur-md text-white rounded-full shadow"
                            onClick={() => handleSingleDelete(photoId)}
                            title="Delete Photo"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}

                        {/* Download Photo */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/20 hover:bg-white/35 border-transparent backdrop-blur-md text-white rounded-full shadow"
                          onClick={() => handleIndividualDownload(photo)}
                          title="Download Original"
                        >
                          <Download size={13} />
                        </Button>

                        {/* Zoom Trigger */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/20 hover:bg-white/35 border-transparent backdrop-blur-md text-white rounded-full shadow"
                          onClick={() => setLightboxIndex(index)}
                          title="Preview Lightbox"
                        >
                          <ZoomIn size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Infinite Scroll / Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
                className="gap-2 text-xs border-muted/50 hover:bg-muted/10 h-9"
              >
                {loading && <LoadingSpinner size={13} />}
                Load More Album Photos
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Trigger */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photo={getMappedPhotosForLightbox()[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
          onDelete={() => handleSingleDelete(getMappedPhotosForLightbox()[lightboxIndex].id)}
          canDelete={type === 'uploads'}
          currentIndex={lightboxIndex}
          totalCount={photos.length}
        />
      )}
    </div>
  );
}
