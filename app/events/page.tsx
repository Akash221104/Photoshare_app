// app/events/page.tsx
// Core Workspace page for listing, joining, and creating Events.

'use client';

import React from 'react';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { useEvents } from '@/hooks/useEvents';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/events/search-bar';
import { EventGrid } from '@/components/events/event-grid';
import { CreateEventDialog } from '@/components/events/create-event-dialog';
import { LoadingSpinner } from '@/components/loading-spinner';

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
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Head */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft size={16} />
              Dashboard
            </Button>
          </Link>
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2">
            <PlusCircle size={16} />
            Create Event
          </Button>
        </div>

        {/* Title Block */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Event Workspaces
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse collaborative galleries you own or have joined.
          </p>
        </div>

        {/* Search Panel */}
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
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
