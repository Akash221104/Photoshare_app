// hooks/useEvent.ts
// Client hook to manage details, members, and settings for a specific event workspace.

import React from 'react';
import { Event, Member } from '@/types/event';

export function useEvent(eventId: string) {
  const [event, setEvent] = React.useState<Event | null>(null);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMembers, setLoadingMembers] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchEventDetails = React.useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to fetch event details');
      }
      const data = await res.json();
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchMembers = React.useCallback(async () => {
    if (!eventId) return;
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/events/${eventId}/members`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to fetch members');
      }
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  }, [eventId]);

  const updateEvent = async (name: string, description: string | null, upload_mode?: 'ALL' | 'HOST_ONLY') => {
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, upload_mode }),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || 'Failed to update event');
    }
    setEvent(body);
    return body as Event;
  };

  const deleteEvent = async () => {
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to delete event');
    }
    return true;
  };

  const leaveEvent = async () => {
    const res = await fetch(`/api/events/${eventId}/leave`, {
      method: 'POST',
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to leave event');
    }
    return true;
  };

  const removeMember = async (memberId: string) => {
    const res = await fetch(`/api/events/${eventId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || 'Failed to remove member');
    }
    // Update local state
    setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
    return true;
  };

  React.useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId, fetchEventDetails]);

  return {
    event,
    members,
    loading,
    loadingMembers,
    error,
    refetchDetails: fetchEventDetails,
    refetchMembers: fetchMembers,
    updateEvent,
    deleteEvent,
    leaveEvent,
    removeMember,
  };
}
