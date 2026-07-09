// app/api/events/[id]/route.ts
// Handles Event details retrieval (GET), updating (PUT), and deletion (DELETE).

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

const eventService = new EventService();

export async function GET(
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

  const response = await eventService.getEvent(eventId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: response.error?.includes('Unauthorized') ? 403 : 404 });
  }
  return NextResponse.json(response.data);
}

export async function PUT(
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
    const response = await eventService.updateEvent(
      eventId,
      body.name,
      body.description,
      body.upload_mode,
      session.user.id
    );
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: response.error?.includes('Unauthorized') ? 403 : 400 });
    }
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

export async function DELETE(
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

  const response = await eventService.deleteEvent(eventId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: response.error?.includes('Unauthorized') ? 403 : 400 });
  }
  return NextResponse.json({ success: true });
}
