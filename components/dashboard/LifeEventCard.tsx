"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

type Props = { event?: string | null; timestamp?: string | null };

export default function LifeEventCard({ event, timestamp }: Props) {
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
        <p className="text-white/90 leading-relaxed">{event || 'Awaiting today\'s awakening...'}</p>
      </div>
    </div>
  );
}
