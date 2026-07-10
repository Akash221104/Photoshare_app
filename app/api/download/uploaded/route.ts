// app/api/download/uploaded/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { downloadService } from '@/services/download.service';

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { eventId } = await request.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const zipBuffer = await downloadService.getUploadedZip(eventId, session.user.id);

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="event-${eventId}-my-uploads.zip"`,
      },
    });
  } catch (error: any) {
    console.error('ZIP Upload download error:', error.message);
    return NextResponse.json({ error: error.message || 'Failed to generate uploads ZIP archive' }, { status: 500 });
  }
}
