// app/api/selfie/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SelfieService } from '@/services/selfie.service';
import { MemberRepository } from '@/database/repositories/member.repository';

const selfieService = new SelfieService();
const memberRepo = new MemberRepository();

export async function GET(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    const selfie = await selfieService.getUserSelfie(session.user.id, eventId);
    if (!selfie) {
      return NextResponse.json(null, { status: 200 });
    }

    // Expose only user-facing metadata, don't return the raw embedding to the client for security
    const { embedding, ...safeSelfie } = selfie;
    return NextResponse.json(safeSelfie, { status: 200 });
  } catch (error: any) {
    console.error('Get Selfie API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve selfie' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    const success = await selfieService.deleteSelfie(session.user.id, eventId);
    return NextResponse.json({ success }, { status: 200 });
  } catch (error: any) {
    console.error('Delete Selfie API error:', error);
    return NextResponse.json({ error: 'Failed to delete selfie' }, { status: 500 });
  }
}
