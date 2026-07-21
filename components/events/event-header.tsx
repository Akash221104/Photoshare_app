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
      {/* Title block & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white border border-[rgba(255,170,80,0.2)] rounded-[28px] p-6 sm:p-7 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#1A1A1A]">
              {event.name}
            </h1>
            <span className="text-[10px] font-extrabold text-[#FB8500] bg-[#FFF8F2] px-2.5 py-0.5 rounded-full border border-[rgba(255,170,80,0.3)] uppercase tracking-wider">
              {role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#525252]">
            {event.description || 'Welcome to your private shared photo gallery workspace.'}
          </p>
        </div>

        {/* Access controls / Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Share Trigger */}
          <button 
            onClick={() => setInviteOpen(true)}
            className="btn-primary-luxury !h-11 !px-5 !text-xs flex items-center gap-2"
          >
            <Share2 size={15} />
            <span>Invite Guests</span>
          </button>

          {/* Leave Trigger (blocked for host) */}
          {!isHost && onLeaveClick && (
            <button
              onClick={onLeaveClick}
              className="px-4 h-11 rounded-full bg-rose-50 text-[#E63946] border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
            >
              <LogOut size={15} />
              <span>Leave Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list (Gallery, Members, Settings) - Modern Glass Pills */}
      <div className="flex bg-[#FFF8F2] p-1.5 rounded-full border border-[rgba(255,170,80,0.22)] w-fit shadow-xs">
        <nav className="flex space-x-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href}>
                <span
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold cursor-pointer transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FFB703] to-[#FB8500] text-white shadow-md shadow-[#FB8500]/25'
                      : 'text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-white/50'
                  }`}
                >
                  <link.icon size={15} />
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
