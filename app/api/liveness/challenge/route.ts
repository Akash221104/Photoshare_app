// app/api/liveness/challenge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/database/db';

export async function GET(request: NextRequest) {
  const { data: session } = await auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const step = searchParams.get('step');

  if (!sessionId || !step) {
    return NextResponse.json({ error: 'sessionId and step are required' }, { status: 400 });
  }

  try {
    const res = await query(`
      SELECT id, user_id, challenges, expires_at, status
      FROM liveness_sessions
      WHERE id = $1;
    `, [sessionId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Liveness session not found' }, { status: 404 });
    }

    const livenessSession = res.rows[0];

    // Security checks
    if (livenessSession.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden: Session does not belong to user' }, { status: 403 });
    }

    if (new Date() > new Date(livenessSession.expires_at)) {
      return NextResponse.json({ error: 'Liveness session expired' }, { status: 400 });
    }

    if (livenessSession.status !== 'PENDING') {
      return NextResponse.json({ error: 'Session is no longer pending validation' }, { status: 400 });
    }

    const challengesList = livenessSession.challenges; // JSON array

    if (step === '2') {
      if (challengesList.length < 2) {
        return NextResponse.json({ error: 'Second challenge not configured' }, { status: 400 });
      }
      return NextResponse.json({ challenge_2: challengesList[1] }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid step request' }, { status: 400 });

  } catch (error: any) {
    console.error('Liveness challenge retrieval API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve challenge step' }, { status: 500 });
  }
}
