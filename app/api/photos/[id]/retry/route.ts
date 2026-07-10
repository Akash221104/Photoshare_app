// app/api/photos/[id]/retry/route.ts
// API route to trigger a processing retry for a failed photo.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PhotoRepository } from '@/database/repositories/photo.repository';
import { EventRepository } from '@/database/repositories/event.repository';
import { EmbeddingRepository } from '@/repositories/embedding.repository';
import { ProcessingStatus } from '@/types/embedding';
import { processingQueue } from '@/services/embedding.service';
import { query } from '@/database/db';

const photoRepo = new PhotoRepository();
const eventRepo = new EventRepository();
const embeddingRepo = new EmbeddingRepository();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch photo to verify existence
    const photo = await photoRepo.getPhotoById(photoId);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // 2. Verify authorization (uploader or host)
    const event = await eventRepo.getEventById(photo.event_id);
    if (!event) {
      return NextResponse.json({ error: 'Event workspace not found' }, { status: 404 });
    }

    const isHost = event.host_id === session.user.id;
    const isUploader = photo.uploaded_by === session.user.id;

    if (!isHost && !isUploader) {
      return NextResponse.json({ error: 'Forbidden: Unauthorized to retry this photo' }, { status: 403 });
    }

    // 3. Verify status: Only retry failed photos
    const currentStatus = (photo as any).processing_status;
    const isFailed = currentStatus === ProcessingStatus.FAILED || photo.status === 'failed';
    if (!isFailed) {
      return NextResponse.json({ error: 'Only failed photos can be retried' }, { status: 400 });
    }

    // 4. Reset status back to PENDING and clear error message
    await embeddingRepo.updateProcessingStatus(photoId, ProcessingStatus.PENDING);
    await query(`UPDATE photos SET processing_error = NULL WHERE id = $1;`, [photoId]);

    // 5. Enqueue back into sequential background processing queue
    processingQueue.enqueue(photoId);

    // 6. Return updated status
    const updatedPhoto = await photoRepo.getPhotoById(photoId);

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error: any) {
    console.error('API Retry error:', error);
    return NextResponse.json({ error: 'Failed to trigger retry: ' + error.message }, { status: 500 });
  }
}
