// components/events/event-card.tsx
// Visual card for event preview listing (Luxury 28px aesthetic).

import React from 'react';
import Link from 'next/link';
import { Calendar, Shield, ArrowRight } from 'lucide-react';
import { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventCardProps {
  event: Event;
  currentUserId: string;
}

export function EventCard({ event, currentUserId }: EventCardProps) {
  const isHost = event.host_id === currentUserId;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className="card-luxury group relative flex flex-col h-full rounded-[28px] overflow-hidden">
      {/* Cover Image Placeholder with Gradient */}
      <div className="h-36 relative flex items-center justify-center overflow-hidden bg-[#FFF8F2] border-b border-[rgba(255,170,80,0.15)]">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_url.replace('/upload/', '/upload/c_fill,w_400,h_250,q_auto,f_auto/')}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center">
            <span className="text-white font-serif-display font-bold text-3xl tracking-widest uppercase opacity-30">
              {event.name.substring(0, Math.min(event.name.length, 3))}
            </span>
          </div>
        )}
        {isHost && (
          <Badge className="absolute top-3 right-3 gap-1 bg-[#FB8500] hover:bg-[#FB8500] text-white font-bold text-xs px-2.5 py-0.5 rounded-full border-none shadow-md shadow-[#FB8500]/20">
            <Shield size={12} />
            Host
          </Badge>
        )}
      </div>

      <CardHeader className="p-5 flex-1 space-y-2">
        <CardTitle className="text-xl font-serif-display font-bold text-[#1A1A1A] group-hover:text-[#FB8500] transition-colors line-clamp-1">
          {event.name}
        </CardTitle>
        <div className="flex items-center gap-2.5 text-xs text-[#8A8A8A] font-medium">
          <p className="flex items-center gap-1">
            <Calendar size={12} className="text-[#FB8500]" />
            {formatDate(event.created_at)}
          </p>
          <span>•</span>
          <p>{event.photo_count || 0} photos</p>
          <span>•</span>
          <p>{event.member_count || 0} members</p>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0 text-sm text-[#525252] line-clamp-2 h-10 flex-1 leading-relaxed">
        {event.description || 'No description provided.'}
      </CardContent>

      <CardFooter className="p-4 border-t border-[rgba(255,170,80,0.15)] flex justify-between items-center bg-[#FFF8F2]/60">
        <span className="text-xs font-mono font-bold bg-white text-[#FB8500] border border-[rgba(255,170,80,0.25)] px-3 py-1 rounded-full shadow-xs">
          {event.join_code}
        </span>
        <Link href={`/events/${event.id}`}>
          <button className="btn-primary-luxury !h-9 !px-4 !text-xs flex items-center gap-1">
            Enter Event
            <ArrowRight size={14} />
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
}
