// app/events/[eventId]/page.tsx
// Privacy-first event workspace landing page.
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
import { Button } from '@/components/ui/button';
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
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-xl font-bold text-red-500">Workspace Error</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {error || 'The requested event could not be found or you do not have permission to view it.'}
          </p>
          <Button onClick={() => router.push('/dashboard')} className="gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isHost = event.host_id === user.id;
  const userRole = isHost ? 'host' : 'guest';
  const canUpload = isHost || event.upload_mode !== 'HOST_ONLY';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push('/events')}>
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Workspaces</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-3">
            <NotificationCenter />
            {canUpload && (
              <Button
                size="sm"
                onClick={() => setUploaderOpen(true)}
                className="gap-1.5 shadow-sm"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Upload Photos</span>
                <span className="sm:hidden">Upload</span>
              </Button>
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
            <div className="flex bg-muted/65 p-1 rounded-lg border border-muted/20 w-fit">
              <button
                onClick={() => setActiveHostTab('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeHostTab === 'dashboard'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Host Dashboard
              </button>
              <button
                onClick={() => setActiveHostTab('gallery')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeHostTab === 'gallery'
                    ? 'bg-background text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Images className="w-3.5 h-3.5 text-indigo-500" />
                Event Gallery
              </button>
            </div>

            {/* Host Mode Banner */}
            <div className="flex items-center gap-2 bg-card/50 border border-muted/40 rounded-xl px-4 py-3 backdrop-blur-sm">
              <LayoutDashboard className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold">Event Management Mode</p>
                <p className="text-[11px] text-muted-foreground">
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
