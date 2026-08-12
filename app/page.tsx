import { players, goalkeepers } from '../lib/config';
import { getSession } from '../lib/session';
import { sql, initDb } from '../lib/db';
import VoteTabs from '../components/VoteTabs';

export const dynamic = 'force-dynamic';

export default async function Home() {
  await initDb();
  const session = await getSession();

  const existingMvpRows = session
    ? await sql`SELECT player_id FROM votes WHERE user_id=${session.id} AND category='mvp'`
    : { rows: [] };
  const existingMvp = existingMvpRows.rows[0] as { player_id: string } | undefined;

  const existingGoalkeeperRows = session
    ? await sql`SELECT player_id FROM votes WHERE user_id=${session.id} AND category='goalkeeper'`
    : { rows: [] };
  const existingGoalkeeper = existingGoalkeeperRows.rows[0] as { player_id: string } | undefined;

  const { rows: playerRows } = await sql`
    SELECT p.player_id, p.score AS organizer_score, COUNT(v.id)::int AS fan_votes 
    FROM organizer_scores p 
    LEFT JOIN votes v ON v.player_id=p.player_id 
    GROUP BY p.player_id
  `;

  const totalFanVotes = playerRows.reduce((sum, row) => sum + Number(row.fan_votes), 0);

  const ranking = players
    .map((player) => {
      const row = playerRows.find((x) => x.player_id === player.id);
      const fanVotes = row ? Number(row.fan_votes) : 0;
      const fanPercent = totalFanVotes ? (fanVotes / totalFanVotes) * 100 : 0;
      const orgScore = row ? Number(row.organizer_score) : 0;
      return {
        ...player,
        fanVotes: fanVotes,
        fanPercent,
        organizerScore: orgScore,
        finalScore: orgScore * 0.6 + fanPercent * 0.4,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);

  const { rows: goalkeeperRows } = await sql`
    SELECT player_id, COUNT(id)::int AS fan_votes 
    FROM votes 
    WHERE category = 'goalkeeper' 
    GROUP BY player_id
  `;

  const totalGoalkeeperVotes = goalkeeperRows.reduce((sum, row) => sum + Number(row.fan_votes), 0);

  const goalkeeperRanks = [...goalkeepers]
    .sort((a, b) => {
      const aVotes = Number(goalkeeperRows.find((x) => x.player_id === a.id)?.fan_votes ?? 0);
      const bVotes = Number(goalkeeperRows.find((x) => x.player_id === b.id)?.fan_votes ?? 0);
      return bVotes - aVotes;
    })
    .map((goalkeeper, index) => [goalkeeper.id, index + 1] as const);

  const goalkeeperRankMap = Object.fromEntries(goalkeeperRanks);

  const goalkeepersWithRank = goalkeepers.map((goalkeeper) => {
    const votes = Number(goalkeeperRows.find((x) => x.player_id === goalkeeper.id)?.fan_votes ?? 0);
    return {
      ...goalkeeper,
      fanVotes: votes,
      rank: goalkeeperRankMap[goalkeeper.id] ?? 0,
    };
  });

  return (
    <main>
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">1337</div>
          <div>
            <p className="eyebrow">1337 FOOTBALL CUP 2026</p>
            <h1>MVP OF THE TOURNAMENT</h1>
            <p className="subtitle">Choose the player who impressed you the most.</p>
          </div>
          {session && (
            <div className="account">
              Signed in as <b>{session.login}</b>
              <a href="/api/auth/logout">Logout</a>
            </div>
          )}
        </div>
      </header>

      <section className="content">
        <div className="rule">
          <span>
            <b>60%</b> Organizers
          </span>
          <span>
            <b>40%</b> Fans
          </span>
          <span>1 vote per 42 account</span>
        </div>

        {!session && (
          <div className="login-box">
            <div>
              <h2>Vote with your 42 account</h2>
              <p>42 authentication keeps the fan vote to one vote per account.</p>
            </div>
            <a className="primary" href="/api/auth/42">
              Login with 42
            </a>
          </div>
        )}

        {session && (
          <div className="notice">
            Your vote has been recorded. You can vote once for MVP and once for Goalkeeper.
          </div>
        )}

        <VoteTabs
          players={players}
          goalkeepers={goalkeepersWithRank}
          loggedIn={!!session}
          existingMvp={existingMvp?.player_id ?? null}
          existingGoalkeeper={existingGoalkeeper?.player_id ?? null}
        />

        <section className="method">
          <h2>How the MVP is decided</h2>
          <div className="method-grid">
            <div>
              <strong>01</strong>
              <span>Fans vote for one nominee.</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Fan votes become a percentage of all fan votes.</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Organizers give each nominee a score from 0–100.</span>
            </div>
            <div>
              <strong>04</strong>
              <span>Final = 60% organizer score + 40% fan percentage.</span>
            </div>
          </div>
        </section>

        <section className="results">
          <div className="section-head">
            <div>
              <p className="eyebrow">FAN VOTE</p>
              <h2>Live ranking</h2>
            </div>
            <span>
              {totalFanVotes} vote{totalFanVotes === 1 ? '' : 's'}
            </span>
          </div>

          <div className="ranking">
            {ranking.map((player, index) => (
              <div className="rank-row" key={player.id}>
                <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                <img src={player.logo} className="tiny-logo" alt="" />
                <div className="rank-name">
                  <b>{player.name}</b>
                  <small>{player.team}</small>
                </div>
                <div className="bar">
                  <i style={{ width: `${player.fanPercent}%` }} />
                </div>
                <b className="percent">{player.fanPercent.toFixed(1)}%</b>
              </div>
            ))}
          </div>
        </section>

        <section className="results">
          <div className="section-head">
            <div>
              <p className="eyebrow">GOALKEEPER VOTE</p>
              <h2>Live ranking</h2>
            </div>
            <span>
              {totalGoalkeeperVotes} vote{totalGoalkeeperVotes === 1 ? '' : 's'}
            </span>
          </div>

          <div className="ranking">
            {goalkeepersWithRank.map((goalkeeper) => {
              const percent = totalGoalkeeperVotes ? (goalkeeper.fanVotes! / totalGoalkeeperVotes) * 100 : 0;
              return (
                <div className="rank-row" key={goalkeeper.id}>
                  <span className="rank">{String(goalkeeper.rank).padStart(2, '0')}</span>
                  {goalkeeper.logo ? <img src={goalkeeper.logo} className="tiny-logo" alt="" /> : <span className="tiny-logo" />}
                  <div className="rank-name">
                    <b>{goalkeeper.name}</b>
                    <small>{goalkeeper.team}</small>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <b className="percent">{percent.toFixed(1)}%</b>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
