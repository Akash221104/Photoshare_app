// app/dashboard/page.tsx
// Core Dashboard landing page (Apple Photos Luxury 28px aesthetic).

'use client';

import React from 'react';
import { Calendar, Image, Users, PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { useEvents } from '@/hooks/useEvents';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Welcome banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#FFF8F2] to-[#FFF6EC] border border-[rgba(255,170,80,0.2)] rounded-[28px] p-8 shadow-sm">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-display text-[#1A1A1A]">
            Welcome back, {user.name} 👋
          </h2>
          <p className="text-[#525252] mt-1 text-sm">
            Create photo sharing workspaces, join via access code, and view your spots.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => setCreateOpen(true)} className="btn-primary-luxury !h-12 !px-6 text-sm flex items-center gap-2">
            <PlusCircle size={18} />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card-luxury p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Total Joined</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-serif-display text-[#1A1A1A]">{stats.total}</div>
            <p className="text-xs text-[#8A8A8A] mt-1">Total active event galleries</p>
          </div>
        </div>

        <div className="card-luxury p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Hosted by Me</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-serif-display text-[#1A1A1A]">{stats.hosted}</div>
            <p className="text-xs text-[#8A8A8A] mt-1">Events created by you</p>
          </div>
        </div>

        <div className="card-luxury p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Guest Memberships</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Image className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-serif-display text-[#1A1A1A]">{stats.joined}</div>
            <p className="text-xs text-[#8A8A8A] mt-1">Joined via invitations</p>
          </div>
        </div>
      </div>

      {/* Join & Search Header bar */}
      <div className="p-4 bg-white rounded-[24px] border border-[rgba(255,170,80,0.2)] shadow-sm">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Recents list & Activity */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Recent Events Grid */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold font-serif-display text-[#1A1A1A]">Recent Workspaces</h3>
            {events.length > 3 && (
              <Link href="/events">
                <button className="btn-secondary-luxury !h-9 !px-4 !text-xs flex items-center gap-1.5">
                  View All
                  <ArrowRight size={14} />
                </button>
              </Link>
            )}
          </div>
          {recentEvents.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[rgba(255,170,80,0.2)] p-8 text-center bg-[#FFFDF8]">
              <Calendar className="h-10 w-10 text-[#FB8500] mb-3 opacity-60" />
              <p className="text-base font-bold text-[#1A1A1A]">No active events found</p>
              <p className="text-xs text-[#8A8A8A] mt-1">Submit a join code or create a new event workspace.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {recentEvents.map((event) => (
                <div key={event.id}>
                  <EventCard event={event} currentUserId={user.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity feed placeholder */}
        <div className="md:col-span-1 space-y-5">
          <h3 className="text-2xl font-bold font-serif-display text-[#1A1A1A]">Notifications Feed</h3>
          <div className="card-luxury p-8 min-h-[240px] flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-base font-bold text-[#1A1A1A]">All caught up!</p>
            <p className="text-xs text-[#8A8A8A]">Updates on photo matches and uploads will appear here.</p>
          </div>
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
