// components/events/event-header.tsx
// Navigational tab bar and workspace details for active events (Luxury aesthetic).

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Share2, Image as ImageIcon, Users, Settings as SettingsIcon, LogOut } from 'lucide-react';

import { Event } from '@/types/event';
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
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif-display font-bold text-[#1A1A1A]">
            {event.name}
          </h1>
          <p className="text-sm text-[#525252] mt-1">
            {event.description || 'Welcome to this shared photo gallery workspace.'}
          </p>
        </div>

        {/* Access controls / Actions */}
        <div className="flex items-center gap-3">
          {/* Share Trigger */}
          <button 
            onClick={() => setInviteOpen(true)}
            className="btn-secondary-luxury !h-11 !px-5 !text-xs flex items-center gap-2"
          >
            <Share2 size={16} />
            Invite Guests
          </button>

          {/* Leave Trigger (blocked for host) */}
          {!isHost && onLeaveClick && (
            <button
              onClick={onLeaveClick}
              className="px-4 h-11 rounded-full bg-red-50 text-[#E63946] border border-red-200 hover:bg-red-100 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <LogOut size={16} />
              Leave Event
            </button>
          )}
        </div>
      </div>

      {/* Tabs list (Gallery, Members, Settings) */}
      <div className="border-b border-[rgba(255,170,80,0.2)]">
        <nav className="-mb-px flex space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={`flex items-center gap-2 border-b-2 py-3 text-sm font-bold cursor-pointer transition-colors ${
                    isActive
                      ? 'border-[#FB8500] text-[#FB8500]'
                      : 'border-transparent text-[#8A8A8A] hover:text-[#1A1A1A]'
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
