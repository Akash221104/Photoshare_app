// components/search/search-container.tsx
'use client';

import React, { useState } from 'react';
import { Camera, ImageOff, Sparkles, Loader2, Upload, Search, Trash2 } from 'lucide-react';
import { SelfieUpload } from '../selfie/selfie-upload';
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
  const [activeTab, setActiveTab] = useState<'uploads' | 'matches'>('uploads');
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header controls (Search & Tab switcher) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/30 border border-muted/50 p-4 rounded-xl shadow-sm backdrop-blur-sm">
        {/* Tab Selector Toggle */}
        <div className="flex bg-muted/65 p-1 rounded-lg border border-muted/20 w-fit">
          <button
            onClick={() => handleTabChange('uploads')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'uploads'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            My Uploads
          </button>
          <button
            onClick={() => handleTabChange('matches')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'matches'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            My Photos (AI)
          </button>
        </div>

        {/* Real-time Search input */}
        <div className="relative flex-1 max-w-sm md:ml-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === 'uploads'
                ? 'Search uploads by filename...'
                : 'Search matches by photographer...'
            }
            value={searchVal}
            onChange={handleSearchChange}
            className="pl-9 h-9 text-xs bg-background border border-muted/50 w-full"
          />
        </div>
      </div>

      {/* 2. Download Center */}
      <DownloadCenter
        eventId={eventId}
        selectedPhotoIds={selectedPhotoIds}
        clearSelection={clearSelection}
        threshold={matchThreshold}
      />

      {/* 3. Conditional Tab Layouts */}
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
        <div className="space-y-8">
          {/* Selfie Box inside AI matches tab */}
          <SelfieUpload
            eventId={eventId}
            selfieUrl={selfieUrl}
            uploading={uploading}
            deleting={deleting}
            onUploadComplete={handleLivenessSuccess}
            onDelete={handleSelfieDeleteSuccess}
          />

          {selfieUrl ? (
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
          ) : (
            <Card className="border border-dashed border-muted/60 bg-muted/5 py-14 text-center">
              <CardContent className="flex flex-col items-center gap-3 max-w-xs mx-auto">
                <div className="bg-muted p-3.5 rounded-full mb-1">
                  <ImageOff className="w-7 h-7 text-muted-foreground/75" />
                </div>
                <h3 className="font-bold text-sm">Personal AI matches locked</h3>
                <p className="text-xs text-muted-foreground">
                  To automatically extract and display all photos where you appear in this event, please upload a selfie in the management box above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
