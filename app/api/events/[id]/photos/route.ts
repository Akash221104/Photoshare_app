// app/api/events/[id]/photos/route.ts
// GET handler to retrieve paginated event gallery photos.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { PhotoService } from '@/services/photo.service';

const photoService = new PhotoService();

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

  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const response = await photoService.getEventGallery(eventId, session.user.id, limit, offset);

  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: 403 });
  }

  return NextResponse.json(response.data);
}
