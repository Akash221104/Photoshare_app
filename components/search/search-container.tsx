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
  const [selfieModalOpen, setSelfieModalOpen] = useState(false);

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
      {/* 1. Top Header Toolbar (Tab Switcher) */}
      <div className="flex items-center justify-between gap-4 bg-white border border-[rgba(255,170,80,0.22)] p-2 sm:p-2.5 rounded-[24px] shadow-sm w-fit">
        {/* Tab Switcher */}
        <div className="flex bg-[#FFF8F2] p-1.5 rounded-full border border-[rgba(255,170,80,0.2)] w-fit shrink-0 max-w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabChange('matches')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'matches'
                ? 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Find My Photos</span>
          </button>

          <button
            onClick={() => handleTabChange('uploads')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              activeTab === 'uploads'
                ? 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>My Uploaded Photos</span>
          </button>
        </div>
      </div>

      {/* 2. Selfie Banner / Trigger Box for "Find My Photos" */}
      {activeTab === 'matches' && (
        <div className="bg-[#FFF6EC] border border-[rgba(255,170,80,0.25)] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shrink-0 shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-base text-[#1A1A1A]">
                {selfieUrl ? 'Selfie Verified & Active ✨' : 'Find Your Photos Instantly'}
              </h4>
              <p className="text-xs text-[#525252]">
                {selfieUrl
                  ? 'Your selfie is active. AI has scanned and unlocked your matched photos below.'
                  : 'Take 1 quick selfie so AI can find and display all your photos from this event.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setSelfieModalOpen(true)}
              className="btn-primary-luxury !h-11 !px-5 !text-xs flex items-center justify-center gap-2 w-full sm:w-auto shadow-md shadow-[#FB8500]/20"
            >
              <Camera size={16} />
              <span>{selfieUrl ? 'Retake Selfie' : 'Take Selfie to Match'}</span>
            </button>
            {selfieUrl && (
              <button
                onClick={handleSelfieDeleteSuccess}
                disabled={deleting}
                className="h-11 w-11 rounded-full bg-rose-50 text-[#E63946] border border-rose-200 hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors"
                title="Remove selfie"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Download Center Actions */}
      <DownloadCenter
        eventId={eventId}
        selectedPhotoIds={selectedPhotoIds}
        clearSelection={clearSelection}
        threshold={matchThreshold}
      />

      {/* 3. Full-Width 100% Photo Gallery */}
      <div className="w-full space-y-6">
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

      {/* Selfie Upload Modal Dialog */}
      {selfieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl sm:max-w-xl max-h-[96vh] overflow-y-auto bg-white border-2 border-[#FB8500] rounded-[24px] sm:rounded-[32px] p-2.5 sm:p-5 shadow-2xl">
            <button
              onClick={() => setSelfieModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-2 rounded-full z-50 font-bold"
            >
              ✕
            </button>
            <SelfieUpload
              eventId={eventId}
              selfieUrl={selfieUrl}
              uploading={uploading}
              deleting={deleting}
              onUploadComplete={() => {
                handleLivenessSuccess();
                setSelfieModalOpen(false);
              }}
              onDelete={async () => {
                await handleSelfieDeleteSuccess();
                setSelfieModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
