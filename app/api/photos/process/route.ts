// app/api/photos/process/route.ts
// API route to trigger synchronous processing on a target photo.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { embeddingService } from '@/services/embedding.service';
import { processPhotoSchema } from '@/schemas/processing.schema';
import { PhotoRepository } from '@/database/repositories/photo.repository';
import { EventRepository } from '@/database/repositories/event.repository';

const photoRepo = new PhotoRepository();
const eventRepo = new EventRepository();

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = processPhotoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { photoId } = result.data;

    // 1. Fetch photo to verify existence
    const photo = await photoRepo.getPhotoById(photoId);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // 2. Fetch event to verify uploader/host privileges
    const event = await eventRepo.getEventById(photo.event_id);
    if (!event) {
      return NextResponse.json({ error: 'Associated event not found' }, { status: 404 });
    }

    const isHost = event.host_id === session.user.id;
    const isUploader = photo.uploaded_by === session.user.id;

    if (!isHost && !isUploader) {
      return NextResponse.json({ error: 'Forbidden: Unauthorized to process this photo' }, { status: 403 });
    }

    // 3. Process photo
    const success = await embeddingService.processPhoto(photoId);
    if (!success) {
      return NextResponse.json({ error: 'Processing task failed. Check server logs.' }, { status: 500 });
    }

    // 4. Return updated photo metadata
    const updatedPhoto = await photoRepo.getPhotoById(photoId);

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error) {
    console.error('API Process error:', error);
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 });
  }
}
