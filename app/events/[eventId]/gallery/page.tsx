// app/events/[eventId]/gallery/page.tsx
// Consumer-grade Event Gallery & Interaction Page.
// Supports guest exploration before login, personalized headers, and return-action execution.

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { InviteLinkModal } from '@/components/events/invite-link-modal';
import {
  Upload, ArrowLeft, LayoutDashboard, Images, Camera,
  Sparkles, Share2, LogOut
} from 'lucide-react';

import { useEvent } from '@/hooks/useEvent';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EventBanner } from '@/components/events/event-banner';
import { EventHeader } from '@/components/events/event-header';
import { HostDashboard } from '@/components/events/host-dashboard';
import { PhotoUploader } from '@/components/upload/photo-uploader';
import { SearchContainer } from '@/components/search/search-container';
import { NotificationCenter } from '@/components/events/notification-center';
import { FloatingShareButton } from '@/components/events/floating-share-button';

interface EventGalleryPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventGalleryPage({ params }: EventGalleryPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { eventId } = React.use(params);
  const { user } = useCurrentUser();
  const { event, loading, error, leaveEvent } = useEvent(eventId);

  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [selfieOpen, setSelfieOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [galleryVersion, setGalleryVersion] = useState(0);

  // Guest Display Name from localStorage
  const [guestName, setGuestName] = useState<string>('');

  // Host view mode: 'dashboard' or 'gallery'
  const [activeHostTab, setActiveHostTab] = useState<'dashboard' | 'gallery'>('gallery');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('photoshare_guest_name');
      if (stored) setGuestName(stored);
    }
  }, []);

  // Handle return action parameter (e.g. ?action=selfie or ?action=upload)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'selfie') {
      setSelfieOpen(true);
    } else if (action === 'upload') {
      setUploaderOpen(true);
    }
  }, [searchParams]);

  const handleProtectedAction = (actionType: 'upload' | 'selfie') => {
    if (user) {
      if (actionType === 'upload') setUploaderOpen(true);
      if (actionType === 'selfie') setSelfieOpen(true);
    } else {
      const returnUrl = `/events/${eventId}/gallery?action=${actionType}`;
      router.push(`/auth/sign-in?redirect=${encodeURIComponent(returnUrl)}`);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this event?')) return;
    try {
      await leaveEvent();
      toast.success('You have left the event.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to leave event');
    }
  };

  const handleUploadSuccess = () => {
    setGalleryVersion((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFFDF8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FB8500]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF8] p-4 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-[#E63946]">Gallery Not Found</h2>
          <p className="text-sm text-[#525252]">
            {error || 'The requested event gallery could not be loaded.'}
          </p>
          <button onClick={() => router.push(`/events/${eventId}`)} className="btn-primary-luxury text-xs">
            <ArrowLeft size={16} className="mr-2" /> Return to Event Welcome
          </button>
        </div>
      </div>
    );
  }

  const isHost = user && event.host_id === user.id;
  const userRole = isHost ? 'host' : 'guest';
  const displayName = user?.name || guestName || 'Guest';

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-4 px-3 sm:py-8 sm:px-10 lg:px-12 text-[#1A1A1A] pb-24">

      {/* Floating Share Button */}
      <FloatingShareButton
        eventId={eventId}
        eventName={event.name}
        hostName={event.host_name || 'Host'}
        joinCode={event.join_code}
      />

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Navigation Header Bar - 1 Single Unified Row */}
        <div className="flex items-center justify-between gap-2 border-b border-[rgba(255,170,80,0.15)] pb-3">
          {/* Back Button & Welcome Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="btn-secondary-luxury !h-10 !w-10 sm:!w-auto sm:!px-4 !p-0 !text-xs flex items-center justify-center gap-1.5 shrink-0"
              title="Back to Event Page"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Event</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#FFF8F2] border border-[rgba(255,170,80,0.3)] px-3 py-2 rounded-full text-xs font-bold text-[#1A1A1A] shadow-xs truncate">
              <span className="truncate max-w-[130px] sm:max-w-xs">Welcome {displayName} 👋</span>
            </div>
          </div>

          {/* Notifications & Upload Button */}
          <div className="flex items-center gap-2 shrink-0">
            {user && <NotificationCenter />}

            <button
              onClick={() => handleProtectedAction('upload')}
              className="btn-primary-luxury !h-10 !px-3.5 sm:!px-5 !text-xs flex items-center gap-1.5 shadow-md shadow-[#FB8500]/20 shrink-0"
            >
              <Upload size={15} />
              <span className="hidden sm:inline">Upload Photos</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>

        {/* Cover Banner */}
        <EventBanner
          name={event.name}
          onInviteClick={() => setInviteOpen(true)}
          onLeaveClick={handleLeave}
          isHost={Boolean(isHost)}
        />

        {/* HOST MODE DASHBOARD TAB TOGGLE */}
        {isHost && (
          <div className="space-y-6 pt-2">
            <div className="flex bg-[#FFF8F2] p-1.5 rounded-full border border-[rgba(255,170,80,0.2)] w-fit max-w-full overflow-x-auto whitespace-nowrap shadow-xs no-scrollbar">
              <button
                onClick={() => setActiveHostTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeHostTab === 'dashboard'
                    ? 'bg-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                    : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Host Dashboard & Share Kit
              </button>
              <button
                onClick={() => setActiveHostTab('gallery')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeHostTab === 'gallery'
                    ? 'bg-[#FF6B6B] text-white shadow-md shadow-[#FF6B6B]/20'
                    : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                }`}
              >
                <Images className="w-4 h-4" />
                Event Gallery
              </button>
            </div>

            {activeHostTab === 'dashboard' && (
              <HostDashboard
                eventId={eventId}
                eventName={event.name}
                hostName={event.host_name || undefined}
                joinCode={event.join_code}
              />
            )}
          </div>
        )}

        {/* GUEST VIEW / GALLERY VIEW */}
        {(!isHost || activeHostTab === 'gallery') && (
          <div className="space-y-6">
            {/* Search Container / Gallery Grid */}
            <SearchContainer eventId={eventId} key={galleryVersion} />
          </div>
        )}
      </div>

      {/* Photo Uploader Modal */}
      {uploaderOpen && (
        <PhotoUploader
          eventId={eventId}
          open={uploaderOpen}
          onOpenChange={(op) => setUploaderOpen(op)}
          onUploadComplete={handleUploadSuccess}
        />
      )}

      {/* Invite Guests Modal */}
      <InviteLinkModal
        event={event}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
