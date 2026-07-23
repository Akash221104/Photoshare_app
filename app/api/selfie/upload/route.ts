// app/api/selfie/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SelfieService } from '@/services/selfie.service';
import { MemberRepository } from '@/database/repositories/member.repository';
import { selfieUploadSchema } from '@/schemas/selfie.schema';

const selfieService = new SelfieService();
const memberRepo = new MemberRepository();

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = selfieUploadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { eventId, image } = result.data;

    // Check membership (auto-enroll authenticated visitors as guest members)
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      await memberRepo.joinEvent(eventId, session.user.id, 'guest');
    }

    // Check size limit: base64 size is approximately 4/3 of binary size
    // 10MB limit in base64 is ~13.3MB characters
    const estimatedSizeBytes = (image.length * 3) / 4;
    const MAX_SELFIE_SIZE = 10 * 1024 * 1024; // 10MB
    if (estimatedSizeBytes > MAX_SELFIE_SIZE) {
      return NextResponse.json({ error: 'Selfie exceeds 10MB limit' }, { status: 400 });
    }

    // Check file format from data URI: data:image/png;base64,...
    const matches = image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    if (!matches) {
      return NextResponse.json({ error: 'Invalid image data uri format' }, { status: 400 });
    }
    const mimeType = matches[1];
    const ACCEPTED_SELFIE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!ACCEPTED_SELFIE_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: 'Invalid file format. Only JPEG, PNG, and WebP are allowed' }, { status: 400 });
    }

    // Call service to process and store selfie
    const selfie = await selfieService.uploadSelfie(session.user.id, eventId, image);

    return NextResponse.json(selfie, { status: 200 });
  } catch (error: any) {
    console.error('Selfie Upload API error:', error);
    const detail = error.message || 'Failed to upload selfie';
    return NextResponse.json({ error: detail }, { status: 400 });
  }
}
