// app/api/gallery/me/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { SelfieService } from '@/services/selfie.service';
import { SearchService } from '@/services/search.service';
import { MemberRepository } from '@/database/repositories/member.repository';

const selfieService = new SelfieService();
const searchService = new SearchService();
const memberRepo = new MemberRepository();

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const thresholdParam = searchParams.get('threshold');
  
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  const threshold = thresholdParam ? parseFloat(thresholdParam) : 0.40;

  try {
    // Check membership
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    // Fetch user's selfie
    const selfie = await selfieService.getUserSelfie(session.user.id, eventId);
    if (!selfie) {
      return NextResponse.json({
        totalPhotosFound: 0,
        highestSimilarity: 0,
        averageSimilarity: 0,
        lastUpdated: null,
      }, { status: 200 });
    }

    // Retrieve stats
    const stats = await searchService.getGalleryStats(
      eventId,
      selfie.embedding,
      threshold,
      selfie.updated_at
    );

    return NextResponse.json(stats, { status: 200 });
  } catch (error: any) {
    console.error('Gallery Stats API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
  }
}
