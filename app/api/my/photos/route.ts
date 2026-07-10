// app/api/my/photos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DownloadRepository } from '@/repositories/download.repository';

const downloadRepo = new DownloadRepository();

export async function GET(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const searchQuery = searchParams.get('query') || '';
  const sortBy = searchParams.get('sortBy') || 'similarity';
  const threshold = parseFloat(searchParams.get('threshold') || '0.40');

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId parameter' }, { status: 400 });
  }

  try {
    let matches = await downloadRepo.getUserMatches(eventId, session.user.id, threshold);

    // Apply search filter if query is provided (searching by photographer / uploader_name)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      matches = matches.filter((match) =>
        match.uploader_name.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply sorting
    if (sortBy === 'similarity') {
      matches.sort((a, b) => b.similarity - a.similarity);
    } else if (sortBy === 'newest') {
      matches.sort((a, b) => new Date(b.photo_created_at).getTime() - new Date(a.photo_created_at).getTime());
    } else if (sortBy === 'oldest') {
      matches.sort((a, b) => new Date(a.photo_created_at).getTime() - new Date(b.photo_created_at).getTime());
    } else if (sortBy === 'size') {
      matches.sort((a, b) => (b.width * b.height) - (a.width * a.height));
    }

    const total = matches.length;
    const paginatedMatches = matches.slice(offset, offset + limit);

    return NextResponse.json({
      photos: paginatedMatches,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error: any) {
    console.error('Failed to retrieve user matched photos:', error);
    return NextResponse.json({ error: 'Failed to fetch matched photos: ' + error.message }, { status: 500 });
  }
}
