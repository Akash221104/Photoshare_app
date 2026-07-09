// components/gallery/personal-gallery.tsx
'use client';

import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, Calendar, User, Sparkles, ZoomIn, Info, Check, CheckSquare, Square, Download } from 'lucide-react';
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

  const allSelected = photos.length > 0 && selectedPhotoIds.length === photos.length;

  return (
    <div className="space-y-6">
      {/* 1. Statistics Cards (Only show for matches or when stats are available) */}
      {type === 'matches' && (
        <>
          {loadingStats && !stats ? (
            <StatsSkeleton />
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Matches Found</p>
                    <h3 className="text-xl font-black mt-1 text-primary">{stats.totalPhotosFound}</h3>
                  </div>
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Highest Similarity</p>
                    <h3 className="text-xl font-black mt-1 text-emerald-500">
                      {stats.highestSimilarity > 0 ? `${(stats.highestSimilarity * 100).toFixed(1)}%` : '0%'}
                    </h3>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-full">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-muted/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Match</p>
                    <h3 className="text-xl font-black mt-1 text-indigo-500">
                      {stats.averageSimilarity > 0 ? `${(stats.averageSimilarity * 100).toFixed(1)}%` : '0%'}
                    </h3>
                  </div>
                  <div className="bg-indigo-500/10 p-2.5 rounded-full">
                    <Sliders className="w-4 h-4 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </>
      )}

      {/* 2. Controls Dashboard */}
      <Card className="border border-muted/40 bg-card/45 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Similarity Threshold Slider (AI Matches only) */}
          {type === 'matches' && threshold !== undefined && setThreshold && (
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold flex items-center gap-1.5">
                  <span>Match Sensitivity</span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {(threshold * 100).toFixed(0)}% Similarity
                  </span>
                </label>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>Lower matches more, higher matches cleaner</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground">30%</span>
                <input
                  type="range"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  min={0.30}
                  max={0.65}
                  step={0.01}
                  className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[10px] text-muted-foreground">65%</span>
              </div>
            </div>
          )}

          {/* Selection Controls & Sorters */}
          <div className="flex flex-wrap items-center gap-3 md:ml-auto">
            {/* Selection actions */}
            {photos.length > 0 && (
              <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5 border border-muted">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={allSelected ? clearSelection : selectAllPhotos}
                  className="text-xs px-2.5 h-8 gap-1.5"
                >
                  {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                </Button>
                {selectedPhotoIds.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    className="text-xs px-2 h-8 text-red-500 hover:text-red-400"
                  >
                    Clear ({selectedPhotoIds.length})
                  </Button>
                )}
              </div>
            )}

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Sort:</span>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-[140px] h-8 bg-background border border-muted/50 text-xs">
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
        </CardContent>
      </Card>

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
        <Card className="border border-dashed border-muted/60 bg-muted/5 py-16 text-center">
          <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
            <Sparkles className="w-8 h-8 text-muted-foreground/60 mb-1" />
            <h4 className="font-semibold text-sm">No photos found</h4>
            <p className="text-xs text-muted-foreground">
              {type === 'matches'
                ? "We couldn't spot your face matching the current threshold. Try dragging the Sensitivity slider left to find more matches."
                : "You haven't uploaded any photos to this event yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {photos.map((photo, index) => {
              const photoId = type === 'matches' ? photo.photo_id : photo.id;
              const isSelected = selectedPhotoIds.includes(photoId);
              const formattedDate = formatDate(type === 'matches' ? photo.photo_created_at : photo.created_at);

              return (
                <Card
                  key={photoId}
                  onClick={() => toggleSelectPhoto(photoId)}
                  className={`group relative overflow-hidden border bg-card hover:shadow-md transition-all duration-300 rounded-lg aspect-[4/3] cursor-pointer select-none ${
                    isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'border-muted/40'
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
                      isSelected ? 'bg-primary border-primary text-white' : 'bg-black/40 border-white/40 text-transparent hover:border-white'
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
                        {/* Download Photo */}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-white/20 hover:bg-white/35 border-transparent backdrop-blur-md text-white rounded-full shadow"
                          onClick={() => handleIndividualDownload(photo)}
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
          currentIndex={lightboxIndex}
          totalCount={photos.length}
        />
      )}
    </div>
  );
}
