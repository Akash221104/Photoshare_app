// app/api/events/[id]/stats/route.ts
// Host-only event statistics (aggregate metrics only, no individual photo access).

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/database/db';
import { MemberRepository } from '@/database/repositories/member.repository';

const memberRepo = new MemberRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only hosts can access event-level statistics
  const role = await memberRepo.getMemberRole(eventId, session.user.id);
  if (role !== 'host') {
    return NextResponse.json({ error: 'Forbidden: Only the event host can view event statistics' }, { status: 403 });
  }

  try {
    // 1. Photo pipeline status distribution
    const photosStatsRes = await query(`
      SELECT
        COUNT(*) AS total_photos,
        COUNT(*) FILTER (WHERE processing_status = 'COMPLETED') AS processed_photos,
        COUNT(*) FILTER (WHERE processing_status = 'PENDING') AS pending_photos,
        COUNT(*) FILTER (WHERE processing_status = 'PROCESSING') AS processing_photos,
        COUNT(*) FILTER (WHERE processing_status = 'FAILED') AS failed_photos,
        SUM(width * height) AS total_pixel_area
      FROM photos
      WHERE event_id = $1
    `, [eventId]);

    // 2. Face detections total
    const facesRes = await query(`
      SELECT COUNT(*) AS total_faces
      FROM photo_faces pf
      JOIN photos p ON pf.photo_id = p.id
      WHERE p.event_id = $1
    `, [eventId]);

    // 3. Member count
    const membersRes = await query(`
      SELECT COUNT(*) AS member_count
      FROM event_members
      WHERE event_id = $1
    `, [eventId]);

    // 4. Selfie uploads count
    const selfiesRes = await query(`
      SELECT COUNT(*) AS selfie_count
      FROM selfies
      WHERE event_id = $1
    `, [eventId]);

    const photoStats = photosStatsRes.rows[0];
    const totalPhotos = parseInt(photoStats.total_photos || 0);
    const processedPhotos = parseInt(photoStats.processed_photos || 0);
    const pendingPhotos = parseInt(photoStats.pending_photos || 0);
    const processingPhotos = parseInt(photoStats.processing_photos || 0);
    const failedPhotos = parseInt(photoStats.failed_photos || 0);
    const totalFaces = parseInt(facesRes.rows[0]?.total_faces || 0);
    const memberCount = parseInt(membersRes.rows[0]?.member_count || 0);
    const selfieCount = parseInt(selfiesRes.rows[0]?.selfie_count || 0);

    const pipelineHealth = totalPhotos > 0
      ? Math.round((processedPhotos / totalPhotos) * 100)
      : 100;

    return NextResponse.json({
      totalPhotos,
      processedPhotos,
      pendingPhotos,
      processingPhotos,
      failedPhotos,
      totalFaces,
      memberCount,
      selfieCount,
      pipelineHealth,
    });
  } catch (error: any) {
    console.error('Event stats API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve event statistics' }, { status: 500 });
  }
}
