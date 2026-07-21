// app/api/liveness/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MemberRepository } from '@/database/repositories/member.repository';
import { SelfieRepository } from '@/repositories/selfie.repository';
import { CloudinaryService } from '@/services/cloudinary.service';
import { PythonService } from '@/services/python.service';
import { query } from '@/database/db';
import crypto from 'crypto';

const memberRepo = new MemberRepository();
const selfieRepo = new SelfieRepository();
const cloudinaryService = new CloudinaryService();
const pythonService = new PythonService();

function getSHA256Hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const sessionId = formData.get('sessionId') as string;
    const baselineFile = formData.get('baseline') as File | null;
    const videoFile = formData.get('video') as File | null;

    if (!sessionId || !baselineFile || !videoFile) {
      return NextResponse.json({ error: 'sessionId, baseline, and video files are required' }, { status: 400 });
    }

    // 1. Retrieve session and verify details
    const sessionRes = await query(`
      SELECT id, user_id, event_id, challenges, expires_at, status, attempt_count
      FROM liveness_sessions
      WHERE id = $1;
    `, [sessionId]);

    if (sessionRes.rowCount === 0) {
      return NextResponse.json({ error: 'Liveness session not found' }, { status: 404 });
    }

    const livenessSession = sessionRes.rows[0];
    const { event_id: eventId, user_id: sessionUserId, challenges: challengesList, expires_at: expiresAt, status: currentStatus } = livenessSession;

    // Security check: owner validation
    if (sessionUserId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: Session does not belong to user' }, { status: 403 });
    }

    // Check membership
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    // Check if session has expired
    if (new Date() > new Date(expiresAt)) {
      return NextResponse.json({ error: 'Liveness session expired. Please start a new session.' }, { status: 400 });
    }

    // Check if session is already completed
    if (currentStatus !== 'PENDING') {
      return NextResponse.json({ error: 'Liveness session has already been completed or verified.' }, { status: 400 });
    }

    // Audit verify: match IP and User Agent hashes to prevent device session hijacking
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = request.headers.get('user-agent') || 'unknown';
    
    const currentIpHash = getSHA256Hash(ip);
    const currentUaHash = getSHA256Hash(ua);

    const auditRes = await query(`
      SELECT ip_hash, user_agent_hash FROM liveness_sessions WHERE id = $1;
    `, [sessionId]);

    const { ip_hash: originalIpHash, user_agent_hash: originalUaHash } = auditRes.rows[0];

    if (currentIpHash !== originalIpHash || currentUaHash !== originalUaHash) {
      return NextResponse.json({ error: 'Security alert: Verification request device mismatch.' }, { status: 400 });
    }

    // Incremented attempt counter
    await query(`
      UPDATE liveness_sessions 
      SET attempt_count = attempt_count + 1 
      WHERE id = $1;
    `, [sessionId]);

    // 2. Call FastAPI Python service to verify liveness
    const baselineBuffer = Buffer.from(await baselineFile.arrayBuffer());
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    console.log(`[Liveness Complete API] Verifying video and baseline files for session ${sessionId}...`);
    
    const livenessResult = await pythonService.verifyLiveness(
      baselineBuffer,
      baselineFile.name || 'baseline.jpg',
      baselineFile.type || 'image/jpeg',
      videoBuffer,
      videoFile.name || 'video.webm',
      videoFile.type || 'video/webm',
      challengesList
    );

    // 3. Process results
    if (livenessResult.passed) {
      console.log(`[Liveness Complete API] Liveness passed! Score: ${livenessResult.score}%. Uploading selfie to Cloudinary...`);
      
      // Upload baseline still photo to Cloudinary
      const base64Data = `data:${baselineFile.type};base64,${baselineBuffer.toString('base64')}`;
      const cloudinaryRes = await cloudinaryService.uploadSelfie(base64Data, eventId, session.user.id);

      try {
        // Save the embedding to database (upsert selfie record)
        const existingSelfie = await selfieRepo.getUserSelfie(session.user.id, eventId);
        if (existingSelfie) {
          await selfieRepo.updateSelfie(
            session.user.id,
            eventId,
            cloudinaryRes.public_id,
            cloudinaryRes.secure_url,
            livenessResult.embedding
          );
        } else {
          await selfieRepo.createSelfie(
            session.user.id,
            eventId,
            cloudinaryRes.public_id,
            cloudinaryRes.secure_url,
            livenessResult.embedding
          );
        }

        // Update database liveness session row
        await query(`
          UPDATE liveness_sessions
          SET status = 'PASSED',
              score = $2,
              completed_at = CURRENT_TIMESTAMP
          WHERE id = $1;
        `, [sessionId, livenessResult.score]);

        return NextResponse.json({
          passed: true,
          score: livenessResult.score,
          checks: livenessResult.checks
        }, { status: 200 });

      } catch (dbErr: any) {
        // Clean up Cloudinary asset if DB write fails
        await cloudinaryService.deletePhoto(cloudinaryRes.public_id);
        throw dbErr;
      }

    } else {
      console.warn(`[Liveness Complete API] Liveness failed. Score: ${livenessResult.score}%. Reasons: ${livenessResult.failure_reasons}`);

      // Update database liveness session row with FAILED status and failure reasons
      await query(`
        UPDATE liveness_sessions
        SET status = 'FAILED',
            score = $2,
            failure_reason = $3
        WHERE id = $1;
      `, [sessionId, livenessResult.score, livenessResult.failure_reasons.join(', ')]);

      return NextResponse.json({
        passed: false,
        score: livenessResult.score,
        checks: livenessResult.checks,
        failure_reasons: livenessResult.failure_reasons
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Liveness completion route error:', error);
    return NextResponse.json({ error: error.message || 'Liveness processing failed' }, { status: 500 });
  }
}
