// app/api/liveness/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { MemberRepository } from '@/database/repositories/member.repository';
import { query } from '@/database/db';
import crypto from 'crypto';

const memberRepo = new MemberRepository();
const CHALLENGE_POOL = ['LOOK_LEFT', 'LOOK_RIGHT', 'LOOK_UP', 'LOOK_DOWN', 'SMILE'];

function getSHA256Hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export async function POST(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId } = body;
    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    // Check event membership
    const isMember = await memberRepo.isMember(eventId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Forbidden: You must be a member of the event' }, { status: 403 });
    }

    // Get IP and User Agent hashes
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = request.headers.get('user-agent') || 'unknown';
    
    const ipHash = getSHA256Hash(ip);
    const uaHash = getSHA256Hash(ua);

    // Pick 2 random challenges without replacement
    const shuffled = [...CHALLENGE_POOL].sort(() => 0.5 - Math.random());
    const selectedChallenges = shuffled.slice(0, 2);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert session
    const res = await query(`
      INSERT INTO liveness_sessions (user_id, event_id, challenges, status, ip_hash, user_agent_hash, expires_at)
      VALUES ($1, $2, $3, 'PENDING', $4, $5, $6)
      ON CONFLICT (user_id, event_id)
      DO UPDATE SET 
        challenges = EXCLUDED.challenges, 
        status = 'PENDING', 
        ip_hash = EXCLUDED.ip_hash, 
        user_agent_hash = EXCLUDED.user_agent_hash, 
        expires_at = EXCLUDED.expires_at, 
        attempt_count = liveness_sessions.attempt_count + 1, 
        score = NULL, 
        failure_reason = NULL, 
        completed_at = NULL
      RETURNING id, challenges, expires_at;
    `, [session.user.id, eventId, JSON.stringify(selectedChallenges), ipHash, uaHash, expiresAt]);

    const activeSession = res.rows[0];

    return NextResponse.json({
      session_id: activeSession.id,
      challenge_1: selectedChallenges[0],
      expires_at: activeSession.expires_at
    }, { status: 200 });

  } catch (error: any) {
    console.error('Liveness session generation API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to start liveness session' }, { status: 500 });
  }
}
