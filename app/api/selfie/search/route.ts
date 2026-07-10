// app/api/selfie/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { SelfieService } from '@/services/selfie.service';
import { SearchService } from '@/services/search.service';
import { MemberRepository } from '@/database/repositories/member.repository';
import { personalSearchSchema } from '@/schemas/search.schema';

const selfieService = new SelfieService();
const searchService = new SearchService();
const memberRepo = new MemberRepository();

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = personalSearchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { eventId, threshold, limit, offset, sortBy } = result.data;

    // Check membership
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    // Check if selfie exists
    const selfie = await selfieService.getUserSelfie(session.user.id, eventId);
    if (!selfie) {
      return NextResponse.json({ error: 'No selfie uploaded for this event. Please upload a selfie first.' }, { status: 400 });
    }

    // Perform vector similarity search
    const searchResult = await searchService.searchPersonalGallery(eventId, selfie.embedding, {
      threshold,
      limit,
      offset,
      sortBy,
    });

    return NextResponse.json(searchResult, { status: 200 });
  } catch (error: any) {
    console.error('Selfie Search API error:', error);
    return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
  }
}
