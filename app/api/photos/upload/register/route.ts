// app/api/photos/upload/register/route.ts
// Registers uploaded photo metadata in the database and triggers the AI processing queue.
// Performs automatic cleanup of Cloudinary assets if database registration fails.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MemberRepository } from '@/database/repositories/member.repository';
import { EventRepository } from '@/database/repositories/event.repository';
import { PhotoRepository } from '@/database/repositories/photo.repository';
import { CloudinaryService } from '@/services/cloudinary.service';
import { processingQueue } from '@/services/embedding.service';

const memberRepo = new MemberRepository();
const eventRepo = new EventRepository();
const photoRepo = new PhotoRepository();
const cloudinaryService = new CloudinaryService();

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
  }

  const { eventId, secure_url, public_id, width, height, bytes, format } = body;

  // Validate fields
  if (!eventId || !secure_url || !public_id || !width || !height) {
    return NextResponse.json(
      { error: 'Missing required photo metadata fields' },
      { status: 400 }
    );
  }

  try {
    // 1. Authorization Guard: Check if user is a member of the event workspace
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      // Clean up asset since upload finished but user lacks authorization
      await cleanupCloudinaryAsset(public_id);
      return NextResponse.json(
        { error: 'Unauthorized: You must join the event before uploading' },
        { status: 403 }
      );
    }

    // 2. Check Event settings (Upload Mode)
    const event = await eventRepo.getEventById(eventId);
    if (!event) {
      await cleanupCloudinaryAsset(public_id);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    if (event.upload_mode === 'HOST_ONLY' && event.host_id !== session.user.id) {
      await cleanupCloudinaryAsset(public_id);
      return NextResponse.json(
        { error: 'Forbidden: Only the event host can upload photos' },
        { status: 403 }
      );
    }

    // 3. Register photo in database
    let photo;
    try {
      photo = await photoRepo.uploadPhoto(
        eventId,
        session.user.id,
        public_id,
        secure_url,
        width,
        height
      );
    } catch (dbError) {
      console.error('Database registration failed, trigger cleanup of Cloudinary asset:', dbError);
      await cleanupCloudinaryAsset(public_id);
      return NextResponse.json(
        { error: 'Failed to save photo metadata to the database' },
        { status: 500 }
      );
    }

    // 4. Enqueue in-memory background processing queue
    try {
      processingQueue.enqueue(photo.id);
    } catch (queueError) {
      console.error('Failed to enqueue photo in AI processing queue:', queueError);
      // We don't fail the request here because the photo is already saved in DB.
      // The gallery has a self-healing queue check when loaded.
    }

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('API photo registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during photo registration' },
      { status: 500 }
    );
  }
}

async function cleanupCloudinaryAsset(publicId: string) {
  try {
    console.log(`[Cleanup] Deleting orphaned Cloudinary asset: ${publicId}`);
    await cloudinaryService.deletePhoto(publicId);
  } catch (err) {
    console.error(`[Cleanup] Failed to delete orphaned Cloudinary asset ${publicId}:`, err);
  }
}
