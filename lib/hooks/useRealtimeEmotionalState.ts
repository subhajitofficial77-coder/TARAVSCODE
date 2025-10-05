"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { getEmotionalState } from '@/lib/supabase/queries';

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function useRealtimeEmotionalState() {
  const [emotionalState, setEmotionalState] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;
    async function init() {
      try {
        const es = await getEmotionalState(supabase);
        setEmotionalState(es);
        setIsLoading(false);

        channel = supabase.channel('emotional-state-changes')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'emotional_state' }, (payload: any) => {
            try {
              const newState = { ...payload.new };
              // Ensure last_event is a string or null for UI consumers
              const le = newState.last_event;
              if (le == null) {
                newState.last_event = null;
              } else if (typeof le === 'object') {
                // Prefer .description if available
                if (typeof le.description === 'string') newState.last_event = le.description;
                else if (typeof le.name === 'string') newState.last_event = le.name;
                else {
                  try { newState.last_event = JSON.stringify(le); } catch { newState.last_event = null; }
                }
              } else {
                newState.last_event = String(le);
              }

              setEmotionalState(newState);
            } catch (e) {
              console.error('Failed to normalize realtime emotional_state payload', e, payload);
              setEmotionalState(payload.new);
            }
          })
          .subscribe();
      } catch (err: any) {
        console.error(err);
        setError('Failed to subscribe to emotional state');
        setIsLoading(false);
      }
    }

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { emotionalState, isLoading, error };
}
