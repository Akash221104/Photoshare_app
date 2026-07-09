// app/api/events/[id]/leave/route.ts
// Handles leaving an event.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

const eventService = new EventService();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await eventService.leaveEvent(eventId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
