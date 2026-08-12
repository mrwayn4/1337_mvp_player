import {NextResponse} from 'next/server';
import db from '../../../lib/db';
import {players} from '../../../lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = db.prepare(
    'SELECT p.player_id, p.score AS organizer_score, COUNT(v.id) AS fan_votes FROM organizer_scores p LEFT JOIN votes v ON v.player_id = p.player_id GROUP BY p.player_id'
  ).all() as any[];

  const total = rows.reduce((a, r) => a + r.fan_votes, 0);
  const results = rows
    .map((r) => {
      const p = players.find((x) => x.id === r.player_id)!;
      const fan = total ? (r.fan_votes / total) * 100 : 0;
      return {
        ...p,
        fanVotes: r.fan_votes,
        fanPercent: fan,
        organizerScore: r.organizer_score,
        finalScore: r.organizer_score * 0.6 + fan * 0.4,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  return NextResponse.json(results);
}

