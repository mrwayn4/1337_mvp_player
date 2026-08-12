'use client';
import {useState} from 'react';
import type {Goalkeeper, Player} from '../lib/config';
import VoteGrid from './VoteGrid';

export default function VoteTabs({
  players,
  goalkeepers,
  loggedIn,
  existingMvp,
  existingGoalkeeper,
}: {
  players: Player[];
  goalkeepers: Goalkeeper[];
  loggedIn: boolean;
  existingMvp: string | null;
  existingGoalkeeper: string | null;
}) {
  const [active, setActive] = useState<'mvp' | 'goalkeeper'>('mvp');

  return (
    <section className="vote-tabs">
      <div className="tab-list">
        <button type="button" className={active==='mvp' ? 'tab-button active' : 'tab-button'} onClick={() => setActive('mvp')}>
          MVP Vote
        </button>
        <button type="button" className={active==='goalkeeper' ? 'tab-button active' : 'tab-button'} onClick={() => setActive('goalkeeper')}>
          Goalkeeper Vote
        </button>
      </div>

      <div className="tab-panel">
        {active === 'mvp' ? (
          <VoteGrid players={players} loggedIn={loggedIn} existingVote={existingMvp} category="mvp" />
        ) : (
          <VoteGrid players={goalkeepers} loggedIn={loggedIn} existingVote={existingGoalkeeper} category="goalkeeper" />
        )}
      </div>

      <p className="tab-note">Each 42 account can vote once for MVP and once for Best Goalkeeper.</p>
    </section>
  );
}
