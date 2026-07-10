// app/api/photos/[id]/route.ts
// Handles single photo detail checks (GET), deletion (DELETE), and status updates (PATCH).

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PhotoService } from '@/services/photo.service';
import { PhotoRepository } from '@/database/repositories/photo.repository';

const photoService = new PhotoService();
const photoRepo = new PhotoRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await photoService.getPhoto(photoId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: response.error?.includes('Unauthorized') ? 403 : 404 });
  }
  return NextResponse.json(response.data);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = await photoService.deletePhoto(photoId, session.user.id);
  if (!response.success) {
    return NextResponse.json({ error: response.error }, { status: response.error?.includes('Unauthorized') ? 403 : 400 });
  }
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: photoId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !['processing', 'processed', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status state' }, { status: 400 });
    }

    // Direct repository call for meta updates (useful for backend status changes)
    const updated = await photoRepo.updatePhotoStatus(photoId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}
// 
