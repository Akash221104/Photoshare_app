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
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF8F2] via-[#FFFDF8] to-[#FFF6EC] border border-[rgba(255,170,80,0.3)] rounded-[32px] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FB8500]/10 border border-[#FB8500]/20 text-[#FB8500] text-xs font-bold mb-1">
              <span>📸 AI Photo Vaults</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-serif-display text-[#1A1A1A] tracking-tight">
              Welcome back, {user.name} 👋
            </h2>
            <p className="text-[#525252] text-xs sm:text-sm font-medium max-w-xl">
              Manage your photo sharing events, search guests with facial AI, or enter an event access code.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCreateOpen(true)}
              className="btn-primary-luxury !h-12 !px-6 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FB8500]/25"
            >
              <PlusCircle size={18} />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white border border-[rgba(255,170,80,0.22)] rounded-[24px] p-5 space-y-2 shadow-xs hover:border-[#FB8500]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Total Events</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif-display text-[#1A1A1A]">{stats.total}</div>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Active photo event galleries</p>
          </div>
        </div>

        <div className="bg-white border border-[rgba(255,170,80,0.22)] rounded-[24px] p-5 space-y-2 shadow-xs hover:border-[#FB8500]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Hosted by Me</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif-display text-[#1A1A1A]">{stats.hosted}</div>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Events created & managed by you</p>
          </div>
        </div>

        <div className="bg-white border border-[rgba(255,170,80,0.22)] rounded-[24px] p-5 space-y-2 shadow-xs hover:border-[#FB8500]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Guest Memberships</span>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center text-white shadow-xs">
              <Image className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-serif-display text-[#1A1A1A]">{stats.joined}</div>
            <p className="text-xs text-[#8A8A8A] mt-0.5">Joined via QR code or invite link</p>
          </div>
        </div>
      </div>

      {/* 3. Search & Join Bar */}
      <div className="bg-[#FFF8F2]/60 rounded-[24px] border border-[rgba(255,170,80,0.2)] p-3.5 shadow-xs">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* 4. Full-Width Events Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold font-serif-display text-[#1A1A1A]">My Events</h3>
            <p className="text-xs text-[#8A8A8A]">Select an event to view, upload, or find your photos with AI.</p>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[rgba(255,170,80,0.25)] p-8 text-center bg-[#FFFDF8] space-y-3">
            <Calendar className="h-10 w-10 text-[#FB8500] opacity-70" />
            <div className="space-y-1">
              <p className="text-base font-bold text-[#1A1A1A]">No event workspaces found</p>
              <p className="text-xs text-[#8A8A8A]">Create your first event workspace or submit an event join code above.</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="btn-primary-luxury !h-10 !px-5 text-xs flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>Create First Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="h-full">
                <EventCard event={event} currentUserId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreateSuccess={refetch}
      />
    </div>
  );
}
