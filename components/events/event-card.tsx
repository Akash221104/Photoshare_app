// components/events/event-card.tsx
// Visual card for event preview listing.

import React from 'react';
import Link from 'next/link';
import { Calendar, Shield, ArrowRight } from 'lucide-react';
import { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <Card className="group relative flex flex-col h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {/* Cover Image Placeholder with Gradient */}
      <div className="h-32 relative flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {event.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_url.replace('/upload/', '/upload/c_fill,w_400,h_250,q_auto,f_auto/')}
            alt={event.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black flex items-center justify-center">
            <span className="text-zinc-600 dark:text-zinc-400 font-extrabold text-2xl tracking-widest uppercase opacity-20 selection:bg-transparent">
              {event.name.substring(0, Math.min(event.name.length, 3))}
            </span>
          </div>
        )}
        {isHost && (
          <Badge className="absolute top-3 right-3 gap-1 bg-white/20 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium">
            <Shield size={12} />
            Host
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 flex-1 space-y-1">
        <CardTitle className="text-lg font-bold tracking-tight text-zinc-900 group-hover:text-primary dark:text-zinc-50 line-clamp-1">
          {event.name}
        </CardTitle>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <p className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(event.created_at)}
          </p>
          <span>•</span>
          <p>{event.photo_count || 0} photos</p>
          <span>•</span>
          <p>{event.member_count || 0} members</p>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 h-10 flex-1">
        {event.description || 'No description provided.'}
      </CardContent>

      <CardFooter className="p-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
        <span className="text-xs font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded">
          {event.join_code}
        </span>
        <Link href={`/events/${event.id}`}>
          <Button size="sm" className="gap-1.5 h-8">
            View Workspace
            <ArrowRight size={14} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
