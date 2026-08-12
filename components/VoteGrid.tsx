'use client';

import { useEffect, useState } from 'react';
import type { Goalkeeper, Player } from '../lib/config';

type VoteCandidate = Player | (Goalkeeper & { rank?: number; fanVotes?: number });

type VoteGridProps = {
  players: VoteCandidate[];
  loggedIn: boolean;
  existingVote: string | null;
  category: 'mvp' | 'goalkeeper';
};

function isPlayer(candidate: VoteCandidate): candidate is Player {
  return 'g' in candidate && 'a' in candidate;
}

function isGoalkeeper(candidate: VoteCandidate): candidate is Goalkeeper {
  return !isPlayer(candidate);
}

export default function VoteGrid({ players, loggedIn, existingVote, category }: VoteGridProps) {
  const [selected, setSelected] = useState(existingVote);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setSelected(existingVote);
    setMsg('');
  }, [existingVote, category]);

  const hasVoted = Boolean(existingVote);
  const selectionChanged = selected !== null && selected !== existingVote;
  const canSubmit = loggedIn && Boolean(selected) && (!hasVoted || selectionChanged);

  async function submit() {
    if (!selected || !loggedIn || (!selectionChanged && hasVoted)) return;
    setLoading(true);

    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selected, category }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.reload();
    } else {
      setMsg(data.error || 'Something went wrong');
    }

    setLoading(false);
  }

  return (
    <section>
      <div className="players-grid">
        {players.map((player) => {
          const active = selected === player.id;
          return (
            <button
              type="button"
              className={`player-card ${active ? 'selected' : ''}`}
              key={player.id}
              onClick={() => loggedIn && setSelected(player.id)}
              disabled={!loggedIn}
            >
              <div className="photo-wrap">
                <img src={player.photo} alt={player.name} />
                <div className="team-pill">
                  {player.logo ? <img src={player.logo} alt="" /> : null}
                  <span>{player.team}</span>
                </div>
                {active && <div className="check">✓</div>}
              </div>

              <div className="player-info">
                <span className="number">
                  {category === 'mvp' ? 'MVP CANDIDATE' : 'GOALKEEPER NOMINEE'}
                </span>
                <h3>{player.name}</h3>
                {category === 'mvp' && isPlayer(player) ? (
                  <div className="player-stats">
                    <div className="stat-card">
                      <span className="stat-value">{player.app}</span>
                      <span className="stat-label">APPS</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{player.g}</span>
                      <span className="stat-label">GOALS</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{player.a}</span>
                      <span className="stat-label">ASSISTS</span>
                    </div>
                  </div>
                ) : isGoalkeeper(player) ? (
                  <div className="player-stats goalkeeper-stats">
                    <div className="stat-card">
                      <span className="stat-value">{player.app}</span>
                      <span className="stat-label">APPS</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{player.cleanSheets}</span>
                      <span className="stat-label">CLEAN SHEETS</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{player.conceded}</span>
                      <span className="stat-label">GOALS CONCEDED</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {loggedIn && (
        <div className="vote-action">
          <button className="primary big" onClick={submit} disabled={!canSubmit || loading}>
            {loading
              ? 'Submitting...'
              : hasVoted
              ? selectionChanged
                ? category === 'mvp'
                  ? 'Change MVP vote'
                  : 'Change GK vote'
                : category === 'mvp'
                ? 'MVP vote already set'
                : 'GK vote already set'
              : category === 'mvp'
              ? 'Confirm MVP vote'
              : 'Confirm GK vote'}
          </button>
          {msg && <span>{msg}</span>}
          {hasVoted && !selectionChanged && (
            <p className="vote-note">You already voted for this candidate. Choose another to update your vote.</p>
          )}
        </div>
      )}
    </section>
  );
}
