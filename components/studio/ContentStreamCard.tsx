"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Trash2, Sparkles, Instagram, Twitter, Linkedin } from 'lucide-react';
import type { GeneratedContent, EmotionalState } from '@/types/database';
import { EMOTION_COLORS, getEmotionColor } from '@/utils/emotionalColors';

type Props = {
  item: GeneratedContent;
  onAccept: (id: string) => void;
  onRefine: (item: GeneratedContent) => void;
  onDiscard: (id: string) => void;
};

function getTopEmotions(emotions: any = {}, count = 3) {
  return Object.entries(emotions)
    .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
    .slice(0, count)
    .map(([k, v]) => ({ name: k, value: v }));
}

function truncateText(text?: string | null, maxLength = 200) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

function getRelativeTime(ts?: string) {
  if (!ts) return '';
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.round(hrs / 24);
    return `${days}d`;
  } catch (e) {
    return '';
  }
}

function getPlatformIcon(platform?: string | null) {
  switch (platform) {
    case 'instagram': return <Instagram className="w-4 h-4" />;
    case 'twitter': return <Twitter className="w-4 h-4" />;
    case 'linkedin': return <Linkedin className="w-4 h-4" />;
    default: return <Sparkles className="w-4 h-4" />;
  }
}

export default function ContentStreamCard({ item, onAccept, onRefine, onDiscard }: Props) {
  const { content_type, content_data, emotional_context, user_feedback, platform, created_at } = item;
  const primary = emotional_context?.primary_emotions ?? {};
  const mood = emotional_context?.mood;
  const top = getTopEmotions(primary, 3);
  const previewText = content_type === 'carousel' ? truncateText((content_data?.metadata?.title as string) || (content_data?.text as string) || '', 150) : truncateText(content_data?.text as string, 200);

  return (
    <motion.article role="article" aria-label={`Generated ${content_type}`} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ scale: 1.02 }} className="glass rounded-xl p-5 studio-glow studio-border-accent">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">{content_type?.toUpperCase()}</div>
          <div className="text-white/60 flex items-center gap-2">{getPlatformIcon(platform)} <span className="text-xs">{getRelativeTime(created_at)}</span></div>
        </div>
        {user_feedback ? (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${user_feedback === 'accepted' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
            {user_feedback === 'accepted' ? (<><Check className="inline w-3 h-3 mr-1" /> Accepted</>) : (<><Trash2 className="inline w-3 h-3 mr-1" /> Discarded</>)}
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <p className="text-white/90">{previewText || 'No preview available'}</p>
      </div>

      <div className="border-t border-white/10 my-4" />

      <div>
        <h4 className="text-sm font-medium text-white flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" /> Emotional Fingerprint</h4>
        {top.length === 0 ? (
          <div className="text-white/50">No emotional data available</div>
        ) : (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {top.map(em => {
                const color = getEmotionColor(em.name);
                // ensure alpha suffix uses hex without leading '#'
                const hex = color.replace('#', '');
                const bg = `#${hex}20`;
                const border = `1px solid #${hex}40`;
                return (
                  <div key={em.name} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: bg, color, border }}>
                    {em.name}: {Math.round(Number(em.value ?? 0) * 100)}%
                  </div>
                );
              })}
            </div>

            {mood ? (
              <div className="text-xs text-white/60">
                <div>Optimism: <span className="text-yellow-300">{Math.round((mood.optimism ?? 0) * 100)}%</span> | Energy: <span className="text-green-300">{Math.round((mood.energy_level ?? 0) * 100)}%</span> | Stress: <span className="text-red-300">{Math.round((mood.stress_level ?? 0) * 100)}%</span></div>
              </div>
            ) : null}
          </div>
        )}
      </div>


  <div className="flex gap-2 mt-4">
        {!item.user_feedback && (
          <>
            <button aria-label="Accept content" onClick={() => onAccept(item.id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 flex items-center gap-2"><Check size={14}/> Accept</button>
            <button aria-label="Refine content" onClick={() => onRefine(item)} className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 flex items-center gap-2"><RefreshCw size={14}/> Refine</button>
            <button aria-label="Discard content" onClick={() => onDiscard(item.id)} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 flex items-center gap-2"><Trash2 size={14}/> Discard</button>
          </>
        )}
        {item.user_feedback && <div className="text-sm text-white/70">Feedback: {item.user_feedback}</div>}
      </div>
    </motion.article>
  );
}
