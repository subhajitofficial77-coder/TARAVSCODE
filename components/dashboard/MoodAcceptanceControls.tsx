"use client";
import React, { useEffect, useState } from 'react';

export default function MoodAcceptanceControls() {
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchProposal() {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation/proposal');
      const j = await res.json();
      if (j?.success) setProposal(j.proposal);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { void fetchProposal(); }, []);

  if (!proposal) return null;

  const proposedMood = proposal?.new_state?.mood;
  const proposedEmotions = proposal?.new_state?.primary_emotions;

  return (
    <div className="mt-3">
      <div className="text-sm text-white/70 mb-2">Proposed mood (preview)</div>
      <div className="flex items-center gap-3">
        <div className="bg-white/5 p-3 rounded">{proposedMood ? `Optimism ${Math.round((proposedMood.optimism||0)*100)}% • Energy ${Math.round((proposedMood.energy_level||0)*100)}%` : 'No mood'}</div>
        <button className="px-3 py-2 bg-green-500/20 text-green-300 rounded" onClick={async () => {
          try {
            const res = await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept_mood', mood: proposedMood, primary_emotions: proposedEmotions }) });
            const j = await res.json();
            if (j?.success) { alert('Mood accepted'); }
          } catch (e) { console.error(e); }
        }}>Accept mood</button>
        <button className="px-3 py-2 bg-red-500/20 text-red-300 rounded" onClick={async () => {
          try { await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject' }) }); await fetchProposal(); } catch (e) { console.error(e); }
        }}>Reject mood</button>
      </div>
    </div>
  );
}
