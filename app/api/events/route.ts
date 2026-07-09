// app/api/events/route.ts
// Handles Event list fetching (GET) and Event creation (POST).

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { EventService } from '@/services/event.service';

const eventService = new EventService();

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await eventService.getAllEvents(session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 500 });
  }
  return NextResponse.json(response.data);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await eventService.createEvent(
      body.name,
      body.description,
      session.user.id,
      body.upload_mode
    );
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
