// app/api/download/selected/route.ts
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
    const { eventId, photoIds, threshold } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: 'Missing or empty photoIds list' }, { status: 400 });
    }

    const similarityThreshold = threshold !== undefined ? parseFloat(threshold) : 0.40;
    const zipBuffer = await downloadService.getSelectedZip(photoIds, session.user.id, eventId, similarityThreshold);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${eventId}-selected-photos.zip"`,
      },
    });
  } catch (error: any) {
    console.error('ZIP Selected download error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate selected photos ZIP archive' }, { status: 500 });
  }
}
