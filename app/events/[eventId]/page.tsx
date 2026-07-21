// app/events/[eventId]/page.tsx
// Privacy-first event workspace landing page (Luxury full-screen aesthetic).
// Members see: My Uploads tab + My Photos (AI) tab.
// Hosts see: Event Dashboard with aggregate metrics only (no member photo access).

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Upload, ArrowLeft, LayoutDashboard, Images, Camera } from 'lucide-react';

import { useEvent } from '@/hooks/useEvent';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { EventBanner } from '@/components/events/event-banner';
import { EventHeader } from '@/components/events/event-header';
import { HostDashboard } from '@/components/events/host-dashboard';
import { PhotoUploader } from '@/components/upload/photo-uploader';
import { SearchContainer } from '@/components/search/search-container';
import { LoadingSpinner } from '@/components/loading-spinner';
import { NotificationCenter } from '@/components/events/notification-center';
import { GalleryGrid } from '@/components/gallery/gallery-grid';

interface EventPageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const { eventId } = React.use(params);
  const { user } = useCurrentUser();
  const { event, loading, error, leaveEvent } = useEvent(eventId);

  const [uploaderOpen, setUploaderOpen] = React.useState(false);
  const [galleryVersion, setGalleryVersion] = React.useState(0);
  // Host view: 'dashboard' or 'gallery'.
  const [activeHostTab, setActiveHostTab] = React.useState<'dashboard' | 'gallery'>('dashboard');

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

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFFDF8]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFDF8] p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-[#E63946]">Workspace Error</h2>
          <p className="text-sm text-[#525252]">
            {error || 'The requested event could not be found or you do not have permission to view it.'}
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary-luxury text-sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHost = event.host_id === user.id;
  const userRole = isHost ? 'host' : 'guest';
  const canUpload = isHost || event.upload_mode !== 'HOST_ONLY';

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-8 px-6 sm:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/events')} className="btn-secondary-luxury !h-11 !px-5 !text-xs flex items-center gap-2">
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Workspaces</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <NotificationCenter />
            {canUpload && (
              <button
                onClick={() => setUploaderOpen(true)}
                className="btn-primary-luxury !h-11 !px-6 !text-xs flex items-center gap-2"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Upload Photos</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}
          </div>
        </div>

        {/* Cover Banner */}
        <EventBanner name={event.name} />

        {/* Workspace Controls */}
        <EventHeader event={event} role={userRole} onLeaveClick={handleLeave} />

        {/* ─────────────────────────────────────────────
            HOST VIEW: Event Dashboard (aggregate stats)
            No access to individual photos or galleries.
        ───────────────────────────────────────────── */}
        {isHost ? (
          <div className="space-y-6 pt-2">
            {/* Host Mode Tabs */}
            <div className="flex bg-[#FFF8F2] p-1.5 rounded-full border border-[rgba(255,170,80,0.2)] w-fit shadow-xs">
              <button
                onClick={() => setActiveHostTab('dashboard')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeHostTab === 'dashboard'
                    ? 'bg-[#FB8500] text-white shadow-md shadow-[#FB8500]/20'
                    : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Host Dashboard
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

            {/* Host Mode Banner */}
            <div className="flex items-center gap-3 bg-[#FFF8F2] border border-[rgba(255,170,80,0.2)] rounded-[24px] px-5 py-4 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shrink-0">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#1A1A1A]">Event Management Mode</p>
                <p className="text-[11px] text-[#525252]">
                  You are viewing the event as a Host. Toggle tabs to switch between metrics and managing the gallery.
                </p>
              </div>
            </div>

            {activeHostTab === 'dashboard' ? (
              <HostDashboard eventId={eventId} />
            ) : (
              <GalleryGrid eventId={eventId} currentUserId={user.id} isHost={true} />
            )}
          </div>
        ) : (
          /* ──────────────────────────────────────────────
             MEMBER VIEW: My Uploads + My Photos (AI)
             Privacy-isolated: sees only own content.
          ─────────────────────────────────────────────── */
          <div className="pt-2">
            <SearchContainer key={galleryVersion} eventId={eventId} />
          </div>
        )}

        {/* Batch Photo Uploader Modal */}
        <PhotoUploader
          eventId={event.id}
          open={uploaderOpen}
          onOpenChange={setUploaderOpen}
          onUploadComplete={handleUploadSuccess}
        />
      </div>
    </div>
  );
}
