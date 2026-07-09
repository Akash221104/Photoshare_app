// app/api/gallery/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { SelfieService } from '@/services/selfie.service';
import { SearchService } from '@/services/search.service';
import { MemberRepository } from '@/database/repositories/member.repository';
import { personalSearchSchema } from '@/schemas/search.schema';

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
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const sortByParam = searchParams.get('sortBy');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    // Validate request query params using personalSearchSchema
    const validated = personalSearchSchema.safeParse({
      eventId,
      threshold: thresholdParam ? parseFloat(thresholdParam) : undefined,
      limit: limitParam ? parseInt(limitParam, 10) : undefined,
      offset: offsetParam ? parseInt(offsetParam, 10) : undefined,
      sortBy: sortByParam || undefined,
    });

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { threshold, limit, offset, sortBy } = validated.data;

    // Check membership
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    // Fetch user's selfie
    const selfie = await selfieService.getUserSelfie(session.user.id, eventId);
    if (!selfie) {
      return NextResponse.json({ photos: [], total: 0 }, { status: 200 }); // Return empty array if no selfie uploaded
    }

    // Perform vector similarity search
    const result = await searchService.searchPersonalGallery(eventId, selfie.embedding, {
      threshold,
      limit,
      offset,
      sortBy,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Gallery Me API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve matched gallery' }, { status: 500 });
  }
}
