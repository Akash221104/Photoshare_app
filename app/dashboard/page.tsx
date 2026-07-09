// app/dashboard/page.tsx
// Core Dashboard landing page. Displays stats, uploader tools, and event grids dynamically.

'use client';

import React from 'react';
import { Calendar, Image, Users, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { useEvents } from '@/hooks/useEvents';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateEventDialog } from '@/components/events/create-event-dialog';
import { SearchBar } from '@/components/events/search-bar';
import { EventCard } from '@/components/events/event-card';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { events, loading, refetch } = useEvents();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const stats = React.useMemo(() => {
    const total = events.length;
    const hosted = events.filter((e) => e.host_id === user?.id).length;
    const joined = total - hosted;
    return { total, hosted, joined };
  }, [events, user?.id]);

  const filteredEvents = React.useMemo(() => {
    if (!searchQuery.trim()) return events;
    return events.filter((e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  const recentEvents = React.useMemo(() => {
    return filteredEvents.slice(0, 3);
  }, [filteredEvents]);

  if (loading || !user) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            Welcome back, {user.name} 👋
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Create photo sharing workspaces, join via access code, and view your spots.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 shadow-sm">
            <PlusCircle size={16} />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400">Total Joined</CardTitle>
            <Calendar className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.total}</div>
            <p className="text-xs text-zinc-500 mt-1">Total active event galleries</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400">Hosted by Me</CardTitle>
            <Users className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.hosted}</div>
            <p className="text-xs text-zinc-500 mt-1">Events created by you</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-400">Guest Memberships</CardTitle>
            <Image className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.joined}</div>
            <p className="text-xs text-zinc-500 mt-1">Joined via invitations</p>
          </CardContent>
        </Card>
      </div>

      {/* Join & Search Header bar */}
      <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Recents list & Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Events Grid */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Recent Workspaces</h3>
            {events.length > 3 && (
              <Link href="/events">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  View All
                  <ArrowRight size={14} />
                </Button>
              </Link>
            )}
          </div>
          {recentEvents.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <Calendar className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No active events found</p>
              <p className="text-xs text-zinc-500 mt-1">Submit a join code or create a new event workspace.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentEvents.map((event) => (
                <div key={event.id}>
                  <EventCard event={event} currentUserId={user.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed placeholder */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Notifications Feed</h3>
          <Card className="shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 min-h-[220px] flex flex-col items-center justify-center p-6 text-center">
            <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">All caught up!</p>
            <p className="text-xs text-zinc-400 mt-1">Updates on photo matches and uploads will appear here.</p>
          </Card>
        </div>
      </div>

      {/* Create Dialog */}
      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateSuccess={refetch}
      />
    </div>
  );
}
