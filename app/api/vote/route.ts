import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { players, goalkeepers } from '../../../lib/config';
import { requireSession, assertSameOrigin } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    const session = await requireSession();
    const { playerId, category } = await req.json();
    const validCategories = ['mvp', 'goalkeeper'];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const pool = category === 'goalkeeper' ? goalkeepers : players;
    const candidateId = String(playerId);

    if (!pool.some((candidate) => candidate.id === candidateId)) {
      return NextResponse.json({ error: 'Invalid candidate' }, { status: 400 });
    }

    const existing = db
      .prepare('SELECT id, player_id FROM votes WHERE user_id=? AND category=?')
      .get(session.id, category) as { id: number; player_id: string } | undefined;

    if (existing && existing.player_id === candidateId) {
      return NextResponse.json({ ok: true });
    }

    if (existing) {
      db.prepare('UPDATE votes SET player_id=?, created_at=? WHERE user_id=? AND category=?').run(
        candidateId,
        new Date().toISOString(),
        session.id,
        category
      );
      return NextResponse.json({ ok: true });
    }

    db.prepare('INSERT INTO votes(user_id,user_login,player_id,category,created_at) VALUES(?,?,?,?,?)').run(
      session.id,
      session.login,
      candidateId,
      category,
      new Date().toISOString()
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Please log in with 42' }, { status: 401 });
    }

    if (error?.message === 'BAD_ORIGIN') {
      return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Vote could not be recorded' }, { status: 500 });
  }
}
