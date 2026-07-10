// app/api/events/[id]/members/[memberId]/route.ts
// Handles moderation action to remove a member from an event.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

const eventService = new EventService();

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id: eventId, memberId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await eventService.removeMember(eventId, memberId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
