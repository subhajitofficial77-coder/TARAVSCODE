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
            setEmotionalState(payload.new);
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
