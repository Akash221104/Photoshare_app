// app/api/events/[id]/join/route.ts
// Handles joining a specific event via a POST request with the joinCode.

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

  try {
    const body = await request.json();
    const { joinCode } = body;

    if (!joinCode) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
    }

    // Call service to validate code and join
    const response = await eventService.joinEvent(joinCode, session.user.id);
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    // Verify the joined event matches the dynamic route ID
    if (response.data.id !== eventId) {
      return NextResponse.json({ error: 'Join code does not match this event ID' }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
