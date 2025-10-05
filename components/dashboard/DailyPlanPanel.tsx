"use client";
import React, { useEffect, useState } from 'react';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { Image, Video, FileText } from 'lucide-react';

const mockPlan = {
  mood: 'Nostalgic & Heartfelt',
  theme: 'Family and Tradition',
  contentQuota: [
    { type: 'carousel', topic: 'Mother-daughter relationships', status: 'pending' },
    { type: 'story', topic: 'Family traditions poll', status: 'pending' },
    { type: 'caption', topic: 'Childhood memories', status: 'pending' }
  ],
  generatedAt: new Date().toISOString()
};

export default function DailyPlanPanel() {
  const [plan, setPlan] = useState(mockPlan);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('mock');
  const [apiMeta, setApiMeta] = useState<any>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const { context: studioContext, refresh: refreshStudio } = useTaraStudio();

  useEffect(() => {
    let mounted = true;
    async function fetchPlan() {
      try {
        // Prefer an active simulation proposal if available
        if (mounted) {
          try {
            const proposalRes = await fetch('/api/simulation/proposal');
            const proposalJson = await proposalRes.json();
            if (proposalJson?.success && proposalJson.proposal && !proposalJson.proposal.rejected && Array.isArray(proposalJson.proposal.candidates) && proposalJson.proposal.candidates.length > 0) {
              // show proposal candidates as preview
              setPlan(prev => ({ ...prev, mood: proposalJson.proposal.proposed_state?.mood || prev.mood, theme: proposalJson.proposal.proposed_state?.theme || prev.theme, contentQuota: proposalJson.proposal.candidates }));
              setDataSource('proposal');
              setApiMeta({ source: 'proposal', proposalId: proposalJson.proposal.id });
              setLoading(false);
              return;
            }
          } catch (e) {
            // ignore and continue to context/db fallbacks
          }
        }

        // Prefer studio context if available
        if (mounted && studioContext && studioContext.master_plan && Array.isArray(studioContext.master_plan?.inspiration_seeds) && studioContext.master_plan?.inspiration_seeds.length > 0) {
          // Map seeds to contentQuota item shape
          const seeds = studioContext.master_plan.inspiration_seeds.map((s: any, idx: number) => ({
            id: s.id || `seed-${idx}`,
            type: s.type,
            topic: s.topic || s.label || s.label,
            status: s.status || 'pending',
            suggested_platform: s.suggested_platform || null,
            short_description: s.label || ''
          }));
          setPlan(prev => ({ ...prev, mood: studioContext.master_plan?.mood_summary || prev.mood, theme: studioContext.master_plan?.theme || prev.theme, contentQuota: seeds }));
          setDataSource('studio-context');
          setApiMeta({ source: 'studio-context' });
        } else {
          const res = await fetch('/api/daily-plan');
          const json = await res.json();
          if (mounted && json && Array.isArray(json.data) && json.data.length > 0) {
            setPlan(prev => ({ ...prev, contentQuota: json.data }));
            setDataSource((json.meta && json.meta.source) || 'api');
            setApiMeta(json.meta || null);
          }
        }
      } catch (e) {
        // ignore and keep mock
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchPlan();
    // Listen for simulation events and refetch when triggered
    const handler = () => { if (mounted) { setLoading(true); fetchPlan(); } };
    window.addEventListener('tara:simulation', handler as any);
    return () => { mounted = false };
  }, []);

  return (
    <>
    <div className="glass rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Daily Plan</h2>
        <p className="text-sm text-white/60">Today's Creative Strategy</p>
      </div>

      <div className="bg-gradient-to-r from-yellow-400/10 to-green-400/10 rounded-xl p-4 border border-white/10">
        <p className="text-sm text-white/60 uppercase tracking-wide">Today's Mood</p>
        <p className="text-2xl font-bold text-white mt-1">{plan.mood}</p>
        <p className="text-sm text-white/70 mt-2">Theme: {plan.theme}</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Content Strategy</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50">{plan.contentQuota.length} pieces planned</span>
            {dataSource === 'proposal' && (
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 rounded bg-green-600 text-white text-xs" onClick={async () => {
                  setSaving(true);
                  try {
                    const items = plan.contentQuota.map((c: any) => ({ ...c }));
                    const res = await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'accept_content', items }) });
                    const j = await res.json();
                    if (j?.success) {
                      // refresh to show committed plans
                      setLoading(true);
                      // re-run fetchPlan flow
                      setDataSource('api');
                      try {
                        const r = await fetch('/api/daily-plan');
                        const json2 = await r.json();
                        if (json2 && Array.isArray(json2.data)) {
                          setPlan(prev => ({ ...prev, contentQuota: json2.data }));
                          setApiMeta(json2.meta || null);
                        }
                      } catch (e) {
                        // ignore
                      } finally { setLoading(false); }
                    }
                  } catch (e) {
                    // ignore
                  } finally { setSaving(false); }
                }}>Accept All</button>
                <button className="px-2 py-1 rounded bg-red-600 text-white text-xs" onClick={async () => {
                  setSaving(true);
                  try {
                    await fetch('/api/simulation/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject' }) });
                    // mark erased and fall back to db/studio context
                    setLoading(true);
                    try {
                      const r = await fetch('/api/daily-plan');
                      const json2 = await r.json();
                      if (json2 && Array.isArray(json2.data) && json2.data.length > 0) setPlan(prev => ({ ...prev, contentQuota: json2.data }));
                      setDataSource('api');
                    } catch (e) {
                      // ignore
                    } finally { setLoading(false); }
                  } catch (e) {
                    // ignore
                  } finally { setSaving(false); }
                }}>Reject Proposal</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          {plan.contentQuota.map((item, idx) => {
            const status = (item.status || 'pending').toString().toLowerCase();
            // create a human label: replace hyphens/underscores with spaces and title-case
            const statusLabel = status.replace(/[-_]/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            let statusClass = 'bg-white/10 text-white/70';
            if (status === 'done') statusClass = 'bg-green-600/20 text-green-300';
            else if (status === 'warm') statusClass = 'bg-yellow-600/20 text-yellow-300';
            else if (status === 'scheduled') statusClass = 'bg-blue-600/20 text-blue-300';
            else if (status === 'in-review' || status === 'in review') statusClass = 'bg-indigo-600/20 text-indigo-300';

        return (
          <div key={idx} className="glass rounded-lg p-4 flex items-center justify-between" role="button" tabIndex={0} onClick={() => setSelected(item)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
                    {item.type === 'carousel' ? <Image className="w-4 h-4 text-yellow-400" /> : item.type === 'story' ? <Video className="w-4 h-4 text-yellow-400" /> : <FileText className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{item.type}</p>
                    <p className="text-sm text-white/60">{item.topic}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>{statusLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40 text-center mt-4">{dataSource && dataSource.startsWith('db') ? 'Showing live DB data' : 'Currently showing mock data  AI-generated plans coming in Phase 5'}</p>
        <div className="text-right">
          <p className="text-xs text-white/40">Source: <span className="font-mono text-xs text-white/60">{dataSource}</span></p>
          {apiMeta && (
            <p className="text-xs text-white/40">Rows: <span className="font-mono text-xs text-white/60">{apiMeta.row_count ?? '-'}</span> {apiMeta.supabase_url ? <span className="ml-2 font-mono text-xs text-white/60">{new URL(apiMeta.supabase_url).hostname}</span> : null}</p>
          )}
        </div>
      </div>
    </div>
    {selected && (
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
        <div className="bg-black/60 fixed inset-0" onClick={() => setSelected(null)} />
        <div className="relative bg-[#0b1220] p-4 rounded-lg w-full max-w-md z-10">
          <h4 className="text-white font-medium">{selected.type} — {selected.topic}</h4>
          <p className="text-sm text-white/60 mt-2">Status: <span className="font-mono text-white/70">{selected.status}</span></p>
          {selected.short_description && (
            <p className="text-sm text-white/70 mt-3">{selected.short_description}</p>
          )}

          <div className="mt-3 space-y-2">
            {selected.suggested_platform && <p className="text-xs text-white/50">Suggested platform: <strong className="text-white">{selected.suggested_platform}</strong></p>}
            {selected.length && <p className="text-xs text-white/50">Suggested length: <strong className="text-white">{selected.length}</strong></p>}
            {selected.suggested_cta && <p className="text-xs text-white/50">Suggested CTA: <strong className="text-white">{selected.suggested_cta}</strong></p>}
            {selected.tags && selected.tags.length > 0 && <p className="text-xs text-white/50">Tags: <span className="font-mono text-white/60">{selected.tags.join(', ')}</span></p>}
            {selected.scheduled_for && <p className="text-xs text-white/50">Scheduled for: <span className="font-mono text-white/60">{new Date(selected.scheduled_for).toLocaleString()}</span></p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm" onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch(`/api/daily-plan/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'scheduled' }) });
                const json = await res.json();
                if (json && json.data) {
                  setPlan((p: any) => ({ ...p, contentQuota: p.contentQuota.map((it: any) => it.id === json.data.id ? { ...it, status: json.data.status } : it) }));
                  setSelected(json.data);
                }
              } finally { setSaving(false); }
            }}>Mark Scheduled</button>
            <button className="px-3 py-1 rounded bg-indigo-600 text-white text-sm" onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch(`/api/daily-plan/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'in-review' }) });
                const json = await res.json();
                if (json && json.data) {
                  setPlan((p: any) => ({ ...p, contentQuota: p.contentQuota.map((it: any) => it.id === json.data.id ? { ...it, status: json.data.status } : it) }));
                  setSelected(json.data);
                }
              } finally { setSaving(false); }
            }}>Mark In Review</button>
            <button className="px-3 py-1 rounded bg-green-600 text-white text-sm" onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch(`/api/daily-plan/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'done' }) });
                const json = await res.json();
                if (json && json.data) {
                  setPlan((p: any) => ({ ...p, contentQuota: p.contentQuota.map((it: any) => it.id === json.data.id ? { ...it, status: json.data.status } : it) }));
                  setSelected(json.data);
                }
              } finally { setSaving(false); }
            }}>Mark Done</button>
            <button className="ml-auto px-3 py-1 rounded bg-white/10 text-white text-sm" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
