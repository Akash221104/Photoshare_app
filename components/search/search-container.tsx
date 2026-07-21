// components/search/search-container.tsx
'use client';

import React, { useState } from 'react';
import { Camera, ImageOff, Sparkles, Loader2, Upload, Search, Trash2 } from 'lucide-react';
import { SelfieUpload } from '../selfie/selfie-upload';
import { InlineEventUploader } from '../upload/inline-event-uploader';
import { PersonalGallery } from '../gallery/personal-gallery';
import { DownloadCenter } from '../download/download-center';
import { useSelfie } from '@/hooks/useSelfie';
import { useMyUploads } from '@/hooks/useMyUploads';
import { useMyPhotos } from '@/hooks/useMyPhotos';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchContainerProps {
  eventId: string;
}

export function SearchContainer({ eventId }: SearchContainerProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'uploads'>('matches');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [searchVal, setSearchVal] = useState<string>('');

  // 1. Fetch Selfie metadata
  const {
    selfieUrl,
    loading: loadingSelfie,
    uploading,
    deleting,
    uploadSelfie,
    deleteSelfie,
    refreshSelfie,
  } = useSelfie(eventId);

  // 2. Fetch User's Uploads
  const {
    photos: uploads,
    loading: loadingUploads,
    error: uploadsError,
    sortBy: sortUploadsBy,
    setSortBy: setSortUploadsBy,
    setSearchQuery: setSearchUploadsQuery,
    hasMore: hasMoreUploads,
    loadMore: loadMoreUploads,
    reload: reloadUploads,
  } = useMyUploads(eventId);

  // 3. Fetch User's AI Matches
  const {
    photos: matches,
    stats: matchesStats,
    loading: loadingMatches,
    loadingStats: loadingMatchesStats,
    error: matchesError,
    sortBy: sortMatchesBy,
    setSortBy: setSortMatchesBy,
    threshold: matchThreshold,
    setThreshold: setMatchThreshold,
    setSearchQuery: setSearchMatchesQuery,
    hasMore: hasMoreMatches,
    loadMore: loadMoreMatches,
    reload: reloadMatches,
  } = useMyPhotos(eventId);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    
    // Pass query down to the active tab's hook
    if (activeTab === 'uploads') {
      setSearchUploadsQuery(val);
    } else {
      setSearchMatchesQuery(val);
    }
  };

  const handleLivenessSuccess = () => {
    refreshSelfie();
    reloadMatches();
  };

  const handleSelfieDeleteSuccess = async () => {
    await deleteSelfie();
    reloadMatches();
  };

  // Selection helpers
  const toggleSelectPhoto = (photoId: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    if (activeTab === 'uploads') {
      const ids = uploads.map((p) => p.id);
      setSelectedPhotoIds(ids);
    } else {
      const ids = matches.map((p) => p.photo_id);
      setSelectedPhotoIds(ids);
    }
  };

  const clearSelection = () => {
    setSelectedPhotoIds([]);
  };

  // Switch tab and clear selection
  const handleTabChange = (tab: 'uploads' | 'matches') => {
    setActiveTab(tab);
    setSearchVal('');
    setSearchUploadsQuery('');
    setSearchMatchesQuery('');
    setSelectedPhotoIds([]);
  };

  if (loadingSelfie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">Loading workspace settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Toolbar (Tab Toggle & Real-time Search Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[rgba(255,170,80,0.22)] p-2.5 sm:p-3.5 rounded-[28px] shadow-sm">
        {/* Luxury Glass Pill Tab Switcher */}
        <div className="flex bg-[#FFF8F2] p-1.5 rounded-full border border-[rgba(255,170,80,0.2)] w-fit shrink-0">
          {/* Tab 1: Take Selfie / Find Me (First / Left) */}
          <button
            onClick={() => handleTabChange('matches')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>Take Selfie / Find Me</span>
          </button>

          {/* Tab 2: My Uploads (Second / Right) */}
          <button
            onClick={() => handleTabChange('uploads')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'uploads'
                ? 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>My Uploads</span>
          </button>
        </div>

        {/* Real-time Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-4 top-3 h-4 w-4 text-[#FB8500]" />
          <Input
            placeholder={
              activeTab === 'uploads'
                ? 'Search your uploads by filename...'
                : 'Search your AI matches...'
            }
            value={searchVal}
            onChange={handleSearchChange}
            className="pl-11 h-11 text-xs bg-[#FFF8F2]/60 border border-[rgba(255,170,80,0.2)] rounded-full focus:border-[#FB8500] w-full text-[#1A1A1A] placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* 2. Modern 2-Column Split Dashboard View */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 Cols): Sticky Assistant & Download Sidebar */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          {/* Conditional Left Sidebar Card (Selfie Liveness for AI Matches / Event Photo Dropzone for My Uploads) */}
          {activeTab === 'matches' ? (
            <SelfieUpload
              eventId={eventId}
              selfieUrl={selfieUrl}
              uploading={uploading}
              deleting={deleting}
              onUploadComplete={handleLivenessSuccess}
              onDelete={handleSelfieDeleteSuccess}
            />
          ) : (
            <InlineEventUploader
              eventId={eventId}
              onUploadComplete={reloadUploads}
            />
          )}

          {/* Download Center Bar */}
          <DownloadCenter
            eventId={eventId}
            selectedPhotoIds={selectedPhotoIds}
            clearSelection={clearSelection}
            threshold={matchThreshold}
          />
        </div>

        {/* Right Column (7 Cols): Main Photo Gallery Grid View */}
        <div className="lg:col-span-7 space-y-6">
          {activeTab === 'uploads' ? (
            <PersonalGallery
              photos={uploads}
              stats={null}
              loading={loadingUploads}
              loadingStats={false}
              error={uploadsError}
              sortBy={sortUploadsBy}
              setSortBy={setSortUploadsBy}
              hasMore={hasMoreUploads}
              loadMore={loadMoreUploads}
              onRefresh={reloadUploads}
              selectedPhotoIds={selectedPhotoIds}
              toggleSelectPhoto={toggleSelectPhoto}
              selectAllPhotos={selectAllPhotos}
              clearSelection={clearSelection}
              type="uploads"
            />
          ) : (
            <PersonalGallery
              photos={matches}
              stats={matchesStats}
              loading={loadingMatches}
              loadingStats={loadingMatchesStats}
              error={matchesError}
              sortBy={sortMatchesBy}
              setSortBy={setSortMatchesBy}
              threshold={matchThreshold}
              setThreshold={setMatchThreshold}
              hasMore={hasMoreMatches}
              loadMore={loadMoreMatches}
              onRefresh={reloadMatches}
              selectedPhotoIds={selectedPhotoIds}
              toggleSelectPhoto={toggleSelectPhoto}
              selectAllPhotos={selectAllPhotos}
              clearSelection={clearSelection}
              type="matches"
            />
          )}
        </div>

      </div>
    </div>
  );
}
