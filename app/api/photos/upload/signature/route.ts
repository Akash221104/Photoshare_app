// app/api/photos/upload/signature/route.ts
// Generates a Cloudinary signature for direct-to-Cloudinary uploads from the browser.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { MemberRepository } from '@/database/repositories/member.repository';
import { EventRepository } from '@/database/repositories/event.repository';
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/schemas/upload.schema';

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const memberRepo = new MemberRepository();
const eventRepo = new EventRepository();

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { eventId, fileType, fileSize } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // 1. Validate File Size
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    // 2. Validate File Type
    if (fileType && !ACCEPTED_IMAGE_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
    }

    // 3. Authorization Guard: Check membership (auto-enroll authenticated visitors as guest members)
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      await memberRepo.joinEvent(eventId, session.user.id, 'guest');
    }

    // 4. Check Event settings (Upload Mode)
    const event = await eventRepo.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    if (event.upload_mode === 'HOST_ONLY' && event.host_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the event host can upload photos' }, { status: 403 });
    }

    // 5. Generate Signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `events/${eventId}`;
    
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp,
      signature,
      folder,
    }, { status: 200 });

  } catch (error) {
    console.error('API Signature generation error:', error);
    return NextResponse.json({ error: 'Failed to generate upload credentials' }, { status: 500 });
  }
}
