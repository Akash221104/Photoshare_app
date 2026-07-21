// app/events/page.tsx
// Core Workspace page for listing, joining, and creating Events (Luxury 28px aesthetic).

'use client';

import React from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useEvents } from '@/hooks/useEvents';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SearchBar } from '@/components/events/search-bar';
import { EventGrid } from '@/components/events/event-grid';
import { CreateEventDialog } from '@/components/events/create-event-dialog';
import { LoadingSpinner } from '@/components/loading-spinner';
import { NotificationCenter } from '@/components/events/notification-center';

export default function EventsListPage() {
  const { user } = useCurrentUser();
  const { events, loading, refetch } = useEvents();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FFFDF8]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-8 px-6 sm:px-10 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Head */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <button className="btn-secondary-luxury !h-11 !px-5 !text-xs flex items-center gap-2">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button onClick={() => setCreateOpen(true)} className="btn-primary-luxury !h-11 !px-6 !text-xs flex items-center gap-2">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </div>

        {/* Title Block */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#1A1A1A]">
            Event Workspaces
          </h1>
          <p className="text-sm text-[#525252] mt-1">
            Browse collaborative galleries you own or have joined.
          </p>
        </div>

        {/* Search Panel */}
        <div className="p-4 bg-white rounded-[24px] border border-[rgba(255,170,80,0.2)] shadow-sm">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        {/* List Grid */}
        <div className="pt-2">
          <EventGrid
            events={filteredEvents}
            currentUserId={user.id}
            onActionClick={() => setCreateOpen(true)}
          />
        </div>

        {/* Create Dialog */}
        <CreateEventDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreateSuccess={refetch}
        />
      </div>
    </div>
  );
}
