"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

type EventLike = string | { description?: string; name?: string; context?: string } | null;
type Props = { event?: EventLike; timestamp?: string | null };

export default function LifeEventCard({ event, timestamp }: Props) {
  const renderedEvent = (() => {
    if (typeof event === 'string') return event;
    if (event && typeof event === 'object') {
      if (typeof event.description === 'string' && event.description.trim().length > 0) return event.description;
      if (typeof event.name === 'string' && event.name.trim().length > 0) return event.name;
      if (typeof event.context === 'string' && event.context.trim().length > 0) return event.context;
      // Fallback to a compact JSON preview for unexpected shapes (kept short)
      try {
        const preview = JSON.stringify(event);
        return preview.length > 160 ? preview.slice(0, 157) + '…' : preview;
      } catch (_) {
        return null;
      }
    }
    return null;
  })();
  return (
    <div className="glass rounded-xl p-4 border-l-4 border-yellow-400">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Today's Narrative</p>
            <p className="text-sm text-white/40">{timestamp ? new Date(timestamp).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-white/90 leading-relaxed">{renderedEvent || 'Awaiting today\'s awakening...'}</p>
      </div>
    </div>
  );
}
