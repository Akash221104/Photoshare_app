// components/events/member-card.tsx
// Renders a member row within the members directory.

'use client';

import React from 'react';
import { Shield, UserMinus } from 'lucide-react';
import { Member } from '@/types/event';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MemberCardProps {
  member: Member;
  isHostUser: boolean; // Is the current logged-in user the host?
  currentUserId: string;
  onRemove: (userId: string) => void;
}

export function MemberCard({ member, isHostUser, currentUserId, onRemove }: MemberCardProps) {
  const isMe = member.user_id === currentUserId;
  const isTargetHost = member.role === 'host';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-950 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 text-sm">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {member.name}
              {isMe && <span className="text-xs font-normal text-zinc-400 ml-1.5">(You)</span>}
            </h4>
            {member.role === 'host' ? (
              <Badge className="bg-zinc-900 hover:bg-zinc-900 text-white border-transparent text-[10px] py-0 px-1.5 h-4 gap-0.5 dark:bg-zinc-100 dark:hover:bg-zinc-100 dark:text-black">
                <Shield size={8} />
                Host
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                Guest
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{member.email}</p>
          <p className="text-[10px] text-zinc-400">Joined {formatDate(member.joined_at)}</p>
        </div>
      </div>

      {/* Moderation Controls: Only host can remove others; nobody can remove the host */}
      {isHostUser && !isTargetHost && !isMe && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5"
          onClick={() => onRemove(member.user_id)}
        >
          <UserMinus size={14} />
          <span className="hidden sm:inline">Remove</span>
        </Button>
      )}
    </div>
  );
}
