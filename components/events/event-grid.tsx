// components/events/event-grid.tsx
// Grid container layout for listing multiple events.

import React from 'react';
import { Event } from '@/types/event';
import { EventCard } from './event-card';
import { EmptyState } from './empty-state';

interface EventGridProps {
  events: Event[];
  currentUserId: string;
  onActionClick?: () => void;
}

export function EventGrid({ events, currentUserId, onActionClick }: EventGridProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="You have not created or joined any photo sharing events yet."
        action={
          onActionClick && (
            <button
              onClick={onActionClick}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Create Your First Event
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <div key={event.id}>
          <EventCard event={event} currentUserId={currentUserId} />
        </div>
      ))}
    </div>
  );
}
