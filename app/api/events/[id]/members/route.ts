// app/api/events/[id]/members/route.ts
// Exposes the list of event members.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

const eventService = new EventService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await eventService.getMembers(eventId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 403 });
  }
  return NextResponse.json(response.data);
}
