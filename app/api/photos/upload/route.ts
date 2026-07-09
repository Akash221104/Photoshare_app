// app/api/photos/upload/route.ts
// API route to handle uploading photos. Parses multipart form-data.

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { PhotoService } from '@/services/photo.service';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/schemas/upload.schema';

const photoService = new PhotoService();

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!eventId) {
      return NextResponse.json({ error: 'No Event ID provided' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    // Validate type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
    }

    // Convert file to base64 Data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload via service
    const response = await photoService.uploadPhoto(eventId, session.user.id, base64Data);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('API Upload error:', error);
    return NextResponse.json({ error: 'Failed to process file upload request' }, { status: 500 });
  }
}
