"use client";
import React, { useEffect, useState } from 'react';

export default function SimulationProposalPanel() {
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchProposal() {
    setLoading(true);
    try {
      const res = await fetch('/api/simulation/proposal');
      const j = await res.json();
      if (j?.success) setProposal(j.proposal);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(() => { void fetchProposal(); }, []);

  if (!proposal) return <div className="text-sm text-white/60">No simulation proposal found.</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm text-white/70">Proposed Content Strategy (preview)</div>
      <ul className="space-y-2">
        {(proposal.candidates || []).map((c: any, i: number) => (
          <li key={i} className="p-2 bg-white/3 rounded">{c.item_type} — {c.topic} <span className="text-xs text-white/60">({c.suggested_platform})</span></li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-green-500/20 text-green-300 rounded" onClick={async () => {
          try {
            const items = (proposal.candidates || []).slice(0, 3).map((c: any) => ({ item_type: c.item_type, topic: c.topic, status: 'pending', priority: c.priority }));
            const res = await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept_content', items }) });
            if (res.ok) { await fetchProposal(); alert('Content accepted and saved'); }
          } catch (e) { console.error(e); }
        }}>Accept content</button>
        <button className="px-3 py-2 bg-red-500/20 text-red-300 rounded" onClick={async () => {
          try { await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject' }) }); await fetchProposal(); } catch (e) { console.error(e); }
        }}>Reject</button>
      </div>
    </div>
  );
}
