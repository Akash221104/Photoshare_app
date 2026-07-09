// app/api/my/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { DownloadRepository } from '@/repositories/download.repository';

const downloadRepo = new DownloadRepository();

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const searchQuery = searchParams.get('query') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    let uploads = await downloadRepo.getUserUploads(eventId, session.user.id);

    // Apply search filter if query is provided (searching by public_id or filename snippet)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      uploads = uploads.filter((photo) =>
        photo.cloudinary_public_id.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    if (sortBy === 'newest') {
      uploads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      uploads.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'size') {
      // Approximate size by dimensions (width * height)
      uploads.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    }

    const total = uploads.length;
    const paginatedUploads = uploads.slice(offset, offset + limit);

    return NextResponse.json({
      photos: paginatedUploads,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error('Failed to retrieve user uploads:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads: ' + error.message }, { status: 500 });
  }
}
