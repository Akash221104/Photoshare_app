// components/gallery/photo-lightbox.tsx
// Full-screen media preview lightbox with enhanced navigation, zoom, swipe, and details.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Trash2, ZoomIn, ZoomOut, Maximize2, RotateCcw, Info } from 'lucide-react';
import { Photo } from '@/types/photo';
import { Button } from '@/components/ui/button';

interface PhotoLightboxProps {
  photo: Photo;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  currentIndex?: number;
  totalCount?: number;
}

export function PhotoLightbox({
  photo,
  onClose,
  onPrev,
  onNext,
  onDelete,
  canDelete = false,
  currentIndex,
  totalCount,
}: PhotoLightboxProps) {
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Touch Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Reset zoom on photo change
  useEffect(() => {
    setZoomScale(1);
  }, [photo]);

  // Handle keyboard arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.cloudinary_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${photo.id}.${photo.cloudinary_url.split('.').pop() || 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(photo.cloudinary_url, '_blank');
    }
  };

  // Zoom helpers
  const zoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 3.0));
  const zoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  const zoomReset = () => setZoomScale(1.0);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 60;  // Swiped left (next)
    const isRightSwipe = distance < -60; // Swiped right (prev)

    if (isLeftSwipe && onNext) onNext();
    if (isRightSwipe && onPrev) onPrev();

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Control bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50 text-white">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs sm:text-sm font-semibold text-zinc-100">
            Uploaded by {photo.uploader_name || 'Guest'}
          </div>
          {currentIndex !== undefined && totalCount !== undefined && (
            <div className="text-[10px] sm:text-xs text-zinc-400 font-medium">
              Image {currentIndex + 1} of {totalCount}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-white/10 rounded-lg px-1.5 py-0.5 border border-white/5 mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white" onClick={zoomOut}>
              <ZoomOut size={16} />
            </Button>
            <span className="text-[10px] text-zinc-400 font-mono w-10 text-center select-none">
              {(zoomScale * 100).toFixed(0)}%
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white" onClick={zoomIn}>
              <ZoomIn size={16} />
            </Button>
            {zoomScale !== 1 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white" onClick={zoomReset}>
                <RotateCcw size={14} />
              </Button>
            )}
          </div>

          {/* Toggle Metadata Info */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/10 ${showInfo ? 'bg-white/10 text-primary' : ''}`}
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info size={18} />
          </Button>

          {/* Fullscreen */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/10"
            onClick={toggleFullscreen}
          >
            <Maximize2 size={18} />
          </Button>

          {/* Download */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/10"
            onClick={handleDownload}
          >
            <Download size={18} />
          </Button>

          {/* Delete */}
          {canDelete && onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-white/10"
              onClick={onDelete}
            >
              <Trash2 size={18} />
            </Button>
          )}

          {/* Close */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full border border-white/10 ml-2"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Left Navigation Arrow */}
      {onPrev && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-6 h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full z-40 hidden md:flex"
          onClick={onPrev}
        >
          <ChevronLeft size={30} />
        </Button>
      )}

      {/* Main Image Container */}
      <div 
        className="relative max-w-[95vw] max-h-[80vh] flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ cursor: zoomScale > 1 ? 'zoom-out' : 'zoom-in' }}
        onClick={() => {
          if (zoomScale > 1) zoomReset();
          else zoomIn();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.cloudinary_url}
          alt="Expanded event memory"
          className="max-w-full max-h-[80vh] object-contain rounded shadow-2xl transition-transform duration-150 ease-out select-none pointer-events-none"
          style={{ transform: `scale(${zoomScale})` }}
          draggable="false"
        />
      </div>

      {/* Right Navigation Arrow */}
      {onNext && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-6 h-12 w-12 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5 rounded-full z-40 hidden md:flex"
          onClick={onNext}
        >
          <ChevronRight size={30} />
        </Button>
      )}

      {/* Photo Info Bottom Tray */}
      {showInfo && (
        <div className="absolute bottom-16 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-white rounded-lg p-4 max-w-sm w-full mx-4 shadow-xl z-50 flex flex-col gap-2">
          <h4 className="font-semibold text-sm flex items-center gap-1.5 text-primary">
            <Info size={14} />
            <span>Image Metadata</span>
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-300">
            <span className="text-zinc-500">Dimensions:</span>
            <span className="font-mono text-right">{photo.width && photo.height ? `${photo.width} x ${photo.height}` : 'Unknown'}</span>
            <span className="text-zinc-500">Photographer:</span>
            <span className="text-right truncate">{photo.uploader_name || 'Guest'}</span>
            <span className="text-zinc-500">Captured At:</span>
            <span className="text-right">{photo.created_at ? new Date(photo.created_at).toLocaleDateString() : 'Unknown'}</span>
            <span className="text-zinc-500">Public ID:</span>
            <span className="text-right truncate font-mono text-[10px]" title={photo.cloudinary_public_id}>{photo.cloudinary_public_id}</span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-6 text-center text-[10px] text-zinc-500 flex flex-col gap-1 items-center">
        <span className="hidden sm:inline">Use Left/Right arrow keys to navigate. Esc to close.</span>
        <span className="md:hidden">Swipe left or right to navigate. Tap to zoom.</span>
      </div>
    </div>
  );
}
