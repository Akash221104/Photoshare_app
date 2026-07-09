// app/api/download/matched/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { downloadService } from '@/services/download.service';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { eventId, threshold } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const similarityThreshold = threshold !== undefined ? parseFloat(threshold) : 0.40;
    const zipBuffer = await downloadService.getMatchedZip(eventId, session.user.id, similarityThreshold);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${eventId}-my-matches.zip"`,
      },
    });
  } catch (error: any) {
    console.error('ZIP Matched download error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate matched photos ZIP archive' }, { status: 500 });
  }
}
