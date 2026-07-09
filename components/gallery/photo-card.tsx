// components/gallery/photo-card.tsx
// Thumbnail view for individual images in the gallery grid. Handles processing overlays and retries.

'use client';

import React from 'react';
import { Trash2, ZoomIn, Clock, User, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProcessing } from '@/hooks/useProcessing';
import { ProcessingStatus } from '@/types/embedding';

interface PhotoCardProps {
  photo: Photo;
  currentUserId: string;
  isHost: boolean;
  onPreview: () => void;
  onDelete: () => void;
  onStatusChange?: () => void;
}

export function PhotoCard({ photo, currentUserId, isHost, onPreview, onDelete, onStatusChange }: PhotoCardProps) {
  const isUploader = photo.uploaded_by === currentUserId;
  const canDelete = isHost || isUploader;

  const initialProcessingStatus = React.useMemo((): ProcessingStatus => {
    if (photo.processing_status) return photo.processing_status as ProcessingStatus;
    if (photo.status === 'processed') return ProcessingStatus.COMPLETED;
    if (photo.status === 'failed') return ProcessingStatus.FAILED;
    return ProcessingStatus.PENDING;
  }, [photo.processing_status, photo.status]);

  const { status, error, retry } = useProcessing(photo.id, initialProcessingStatus, onStatusChange);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // Convert default url to optimized Cloudinary thumbnail transform
  const thumbnailUrl = React.useMemo(() => {
    if (!photo.cloudinary_url) return '';
    // Inject w_400,c_fill transformations into Cloudinary URL path
    const urlParts = photo.cloudinary_url.split('/upload/');
    if (urlParts.length !== 2) return photo.cloudinary_url;
    return `${urlParts[0]}/upload/c_fill,w_400,h_300,q_auto,f_auto/${urlParts[1]}`;
  }, [photo.cloudinary_url]);

  return (
    <div className={cn(
      "group relative rounded-xl border overflow-hidden bg-white dark:bg-zinc-950 aspect-4/3 shadow-sm hover:shadow-md transition-all",
      status === ProcessingStatus.FAILED 
        ? "border-red-500/40 dark:border-red-500/30" 
        : "border-zinc-200/50 dark:border-zinc-800/50"
    )}>
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt="Event capture"
        className={cn(
          "h-full w-full object-cover transition-transform duration-300",
          status === ProcessingStatus.COMPLETED && "group-hover:scale-105",
          (status === ProcessingStatus.PENDING || status === ProcessingStatus.PROCESSING) && "blur-[2px] opacity-75"
        )}
        loading="lazy"
      />

      {/* 1. Pending & Processing Overlay */}
      {(status === ProcessingStatus.PENDING || status === ProcessingStatus.PROCESSING) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px] text-white z-20 space-y-2 p-3 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-300">
            {status === ProcessingStatus.PENDING ? 'Pending' : 'Processing...'}
          </span>
          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-sm bg-black/40 hover:bg-red-600/80 border-transparent text-white"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      )}

      {/* 2. Failed Overlay */}
      {status === ProcessingStatus.FAILED && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-white z-20 space-y-2.5 p-3.5 text-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide">AI Processing Failed</p>
            <p className="text-[9px] text-zinc-400 line-clamp-2 max-w-full px-1">
              {error || photo.processing_error || 'Unknown inference error'}
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-3.5 bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 text-[10px] font-semibold rounded-full gap-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
            >
              <RefreshCw size={10} />
              Retry
            </Button>
            {canDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-7 w-7 rounded-full bg-red-950/40 hover:bg-red-600 border border-red-500/20 text-red-200 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={11} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. Completed Hover Overlay */}
      {status === ProcessingStatus.COMPLETED && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 z-10">
          {/* Top bar controls */}
          <div className="flex justify-end gap-2">
            {/* Zoom Trigger */}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-white/20 hover:bg-white/35 border-transparent backdrop-blur-md text-white rounded-full"
              onClick={onPreview}
            >
              <ZoomIn size={14} />
            </Button>

            {/* Delete Trigger */}
            {canDelete && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>

          {/* Bottom bar details */}
          <div className="text-white space-y-1">
            <p className="text-xs font-semibold flex items-center gap-1.5 drop-shadow">
              <User size={12} className="opacity-80" />
              {photo.uploader_name || 'Uploader'}
            </p>
            <p className="text-[10px] flex items-center gap-1.5 opacity-85 drop-shadow">
              <Clock size={10} />
              {formatDate(photo.created_at)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
