// components/events/event-header.tsx
// Navigational tab bar and workspace details for active events.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2, Image as ImageIcon, Users, Settings as SettingsIcon, LogOut } from 'lucide-react';

import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { InviteLinkModal } from './invite-link-modal';

interface EventHeaderProps {
  event: Event;
  role: 'host' | 'guest' | 'admin';
  onLeaveClick?: () => void;
}

export function EventHeader({ event, role, onLeaveClick }: EventHeaderProps) {
  const pathname = usePathname();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const isHost = role === 'host';

  const navLinks = React.useMemo(() => {
    const base = [
      { name: 'Gallery', href: `/events/${event.id}`, icon: ImageIcon },
      { name: 'Members', href: `/events/${event.id}/members`, icon: Users },
    ];
    if (isHost) {
      base.push({ name: 'Settings', href: `/events/${event.id}/settings`, icon: SettingsIcon });
    }
    return base;
  }, [event.id, isHost]);

  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {event.name}
          </h2>
          <p className="text-sm text-zinc-500 mt-1 dark:text-zinc-400">
            {event.description || 'Welcome to this shared photo gallery workspace.'}
          </p>
        </div>

        {/* Access controls / Actions */}
        <div className="flex items-center gap-2">
          {/* Share Trigger */}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
            <Share2 size={14} />
            Invite Guests
          </Button>

          {/* Leave Trigger (blocked for host) */}
          {!isHost && onLeaveClick && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5"
              onClick={onLeaveClick}
            >
              <LogOut size={14} />
              Leave Event
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list (Gallery, Members, Settings) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={`flex items-center gap-2 border-b-2 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                    isActive
                      ? 'border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50'
                      : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Invitation Modal */}
      <InviteLinkModal event={event} open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
