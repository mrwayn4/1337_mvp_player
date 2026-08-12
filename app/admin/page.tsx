import {redirect} from 'next/navigation';
import {getSession} from '../../lib/session';
import {adminLogins,players} from '../../lib/config';
import { sql, initDb } from '../../lib/db';
import AdminScores from '../../components/AdminScores';
export const dynamic='force-dynamic';
export default async function Admin(){
  await initDb();
  const s=await getSession();
  if(!s||!adminLogins().includes(s.login.toLowerCase()))redirect('/');
  const { rows } = await sql`SELECT player_id,score FROM organizer_scores`;
  return <AdminScores players={players} initialScores={Object.fromEntries(rows.map(r=>[r.player_id,r.score]))}/>
}
