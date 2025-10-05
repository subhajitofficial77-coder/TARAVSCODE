"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';

export default function TodaysNarrativeHeader() {
  const { context, isLoading, error, refresh } = useTaraStudio();
  const { dominantEmotion } = useEmotionalStyling();
  const [isAutoSeeding, setIsAutoSeeding] = React.useState(false);
  const [initAttempts, setInitAttempts] = React.useState(0);

  const master = context?.master_plan;
  const tale = context?.tale_event;
  const weather = context?.weather;
  const relationships = context?.relationships || [];

  if (isLoading) {
    return (
      <header aria-label="TARA's current creative context" role="status" className="glass rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-white/6 rounded mb-4 w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-white/6 rounded" />
          <div className="h-20 bg-white/6 rounded" />
          <div className="h-20 bg-white/6 rounded" />
        </div>
      </header>
    );
  }

  if (!isLoading && !context) {
    return (
      <header aria-label="TARA's current creative context" role="status" className="glass rounded-2xl p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Setting Up TARA's Studio</h2>
          <p className="text-white/70 mb-4">
            {initAttempts > 1
              ? "Having trouble initializing the Studio. Let's try to fix that."
              : "Initializing your creative workspace..."}
          </p>
          
          {isAutoSeeding ? (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full" />
              <span className="text-white/80">Creating master plan and inspiration seeds...</span>
            </div>
          ) : (
            <button
              onClick={async () => {
                setIsAutoSeeding(true);
                setInitAttempts(prev => prev + 1);
                await refresh();
                setIsAutoSeeding(false);
              }}
              disabled={isAutoSeeding}
              className="px-6 py-3 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 text-yellow-400 transition-all disabled:opacity-50 mb-4"
            >
              {initAttempts > 1 ? 'Try Again' : 'Initialize Studio'}
            </button>
          )}

          {initAttempts > 1 && (
            <div className="mt-6 text-left">
              <details className="text-sm">
                <summary className="text-white/60 hover:text-white/80 cursor-pointer mb-2">
                  Troubleshooting Tips
                </summary>
                <div className="px-4 py-3 rounded-lg bg-black/20 text-white/60 space-y-2">
                  <p>1. Check that edge functions are deployed: <code className="px-1 py-0.5 rounded bg-black/20">supabase functions deploy studio-context</code></p>
                  <p>2. Verify environment variables in <code className="px-1 py-0.5 rounded bg-black/20">.env.local</code></p>
                  <p>3. Review <code className="px-1 py-0.5 rounded bg-black/20">STUDIO_TROUBLESHOOTING.md</code> for detailed solutions</p>
                  <p>4. Check browser console (F12) for specific errors</p>
                  <a
                    href="/docs/STUDIO_TROUBLESHOOTING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-yellow-400 hover:text-yellow-300"
                  >
                    View Full Troubleshooting Guide →
                  </a>
                </div>
              </details>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <motion.header aria-label="TARA's current creative context" className="glass rounded-2xl p-6 studio-glow studio-border-accent" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-900/70 text-white flex items-center justify-between">
          <div className="text-sm space-y-1">
            <div>Failed to load studio context: {error}</div>
            {initAttempts > 1 && (
              <div className="text-white/60">
                <a
                  href="/docs/STUDIO_TROUBLESHOOTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 text-xs"
                >
                  View Troubleshooting Guide →
                </a>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                setIsAutoSeeding(true);
                setInitAttempts(prev => prev + 1);
                await refresh();
                setIsAutoSeeding(false);
              }}
              disabled={isAutoSeeding}
              className="text-sm underline disabled:opacity-50 flex items-center gap-1"
            >
              {isAutoSeeding && (
                <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
              )}
              {isAutoSeeding ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold studio-text-accent">TARA's Studio</h1>
          <p className="text-white/90 mt-2">{tale?.description ?? master?.narrative ?? 'A quiet day of creation. TARA is tuning into the muse.'}</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
          <div className="glass p-3 rounded-lg">
            <div className="text-sm text-white/70">Creative Mood</div>
            <div className="font-semibold text-white">{master?.mood_summary ?? dominantEmotion}</div>
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-sm text-white/70">Latest Event</div>
            <div className="font-semibold text-white truncate" title={tale?.description ?? 'No recent events'}>
              {tale?.description ?? 'No recent events'}
              {tale?.timestamp && (
                <span className="text-xs text-white/60 ml-2">· </span>
              )}
            </div>
            {tale?.timestamp && (
              <div className="text-xs text-white/60 mt-1 group relative">
                <time title={new Date(tale.timestamp).toLocaleString()} dateTime={tale.timestamp}>
                  {formatDistanceToNowStrict(parseISO(tale.timestamp), { addSuffix: true })}
                </time>
              </div>
            )}
          </div>
          <div className="glass p-3 rounded-lg">
            <div className="text-sm text-white/70">Weather</div>
            <div className="font-semibold text-white">{weather ? `${Math.round(weather.temp_c ?? 0)}°C • ${weather.condition ?? '—'}` : '—'}</div>
            {weather?.location && <div className="text-xs text-white/60">in {weather.location}</div>}
          </div>
        </div>
      </div>

      {relationships.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {relationships.slice(0, 3).map((r) => (
            <div key={r.id} className="glass px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <span className="text-white/80">{r.entity_name}</span>
              <span className="text-white/60">{r.status === 'excellent' ? '❤️' : r.status === 'warm' ? '💛' : '🤝'}</span>
            </div>
          ))}
        </div>
      )}
    </motion.header>
  );
}
