"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import type { InspirationSeed } from '@/types/database';
import type { ContentGenerationRequest } from '@/types/content';

export default function InspirationHub({ onContentGenerated }: { onContentGenerated?: (item: any) => void }) {
  const { context, isLoading } = useTaraStudio();
  const { dominantEmotion } = useEmotionalStyling();
  const master = context?.master_plan;
  const seeds = master?.inspiration_seeds || [];

  const [selectedSeed, setSelectedSeed] = useState<InspirationSeed | null>(null);
  const [coPilotNotes, setCoPilotNotes] = useState('');
  const [contentType, setContentType] = useState<'carousel' | 'story' | 'caption' | 'post'>('carousel');
  const [platform, setPlatform] = useState<'instagram' | 'twitter' | 'linkedin'>('instagram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const req: ContentGenerationRequest & any = {
        contentType: (selectedSeed?.type as any) ?? contentType,
        platform,
        userPrompt: coPilotNotes || undefined,
        theme: master?.theme || undefined,
        seedId: selectedSeed?.id,
        seedLabel: selectedSeed?.label,
        seedTopic: selectedSeed?.topic,
      };

      const res = await fetch('/api/generate-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = (data && (data.error || data.message)) || `Server returned ${res.status}`;
        setError(message);
        toast.error(`Generation failed: ${message}`);
        return;
      }

      if (data?.success && data.content) {
        onContentGenerated?.(data.content as any);
        toast.success('Content generated');
      } else {
        const message = data?.error || 'Unknown error';
        setError(message);
        toast.error(`Generation failed: ${message}`);
      }
    } catch (err) {
      console.error('generate error', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      toast.error('Generate request failed: ' + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{master?.narrative ?? "TARA's Creative Plan"}</h3>
            <p className="text-sm text-white/80 mt-1">{master?.mood_summary ?? 'A quiet creative day.'}</p>
          </div>
          <div className="text-sm text-white/70">{master?.quota ? `Quota: ${JSON.stringify(master.quota)}` : ''}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm text-white/70 mb-2">Inspiration Seeds</h4>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-24 bg-white/3 rounded animate-pulse" />
            <div className="h-24 bg-white/3 rounded animate-pulse" />
          </div>
        ) : seeds.length === 0 ? (
          <div className="text-white/60">No inspiration seeds available. Generate content manually below.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seeds.map((s) => (
              <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} aria-label={`Select inspiration seed: ${s.label}`} aria-selected={selectedSeed?.id === s.id} onClick={() => { setSelectedSeed(s); setContentType(s.type as any); }} className={`glass p-3 rounded-lg text-left w-full ${selectedSeed?.id === s.id ? 'studio-border-accent' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{s.label}</div>
                    <div className="text-xs text-white/60 mt-1">{s.topic}</div>
                  </div>
                  <div className="text-xs text-white/60">{s.priority}</div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div>
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-900/70 text-white flex items-start justify-between">
            <div>{error}</div>
            <button onClick={() => setError(null)} className="text-sm underline ml-4">Dismiss</button>
          </div>
        )}

        {selectedSeed ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-white/70">Creating: <span className="font-semibold text-white">{selectedSeed.label}</span></div>
              <button aria-label="Clear selected seed and return to manual creation" title="Return to manual creation" onClick={() => { setSelectedSeed(null); setCoPilotNotes(''); }} className="text-xs text-white/70 hover:text-white/90">Clear seed</button>
            </div>
            <textarea
              placeholder={
                selectedSeed.type === 'carousel'
                  ? "Carousel tip: mention up to 5 moments, visual cues, or a mood to anchor each slide (e.g., 'cozy morning, sunlight, handwritten note')."
                  : selectedSeed.type === 'story'
                  ? "Story tip: give a short arc or single moment you want expanded (e.g., 'my first day at the beach and what changed me')."
                  : selectedSeed.type === 'caption'
                  ? "Caption tip: provide voice/tone and a hook (e.g., 'witty, 2-line hook about resilience')."
                  : selectedSeed.type === 'post'
                  ? "Post tip: include audience intent and key points to cover (e.g., 'share a lesson for founders: 3 bullet takeaways')."
                  : "Add details or leave blank for TARA's interpretation..."
              }
              value={coPilotNotes}
              onChange={(e) => setCoPilotNotes(e.target.value)}
              className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg text-white"
            />
            <div className="flex justify-end mt-3">
              <button onClick={generate} disabled={loading || (!coPilotNotes && !selectedSeed)} aria-busy={loading} className="px-4 py-2 studio-glow rounded text-white bg-yellow-500/80">{loading ? 'Creating with TARA...' : 'Create Together'}</button>
            </div>
          </motion.div>
        ) : (
          <div className="glass rounded-lg p-4">
            <div className="mb-2 text-white/70">Manual Creation (seed-driven recommended)</div>
            <div className="flex gap-2 mb-2">
              <select value={contentType} onChange={(e) => setContentType(e.target.value as any)} className="border p-1 rounded bg-black/20 text-white">
                <option value="carousel">Carousel</option>
                <option value="story">Story</option>
                <option value="caption">Caption</option>
                <option value="post">Post</option>
              </select>
              <select value={platform} onChange={(e) => setPlatform(e.target.value as any)} className="border p-1 rounded bg-black/20 text-white">
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <textarea placeholder="Optional instruction or user prompt" value={coPilotNotes} onChange={(e) => setCoPilotNotes(e.target.value)} className="w-full h-24 p-3 bg-white/5 border border-white/10 rounded-lg text-white" />
            <div className="flex justify-end mt-3">
              <button onClick={generate} disabled={loading || (!coPilotNotes && !selectedSeed)} className="px-4 py-2 studio-glow rounded text-white bg-yellow-500/80">{loading ? 'Creating...' : 'Create Together'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
