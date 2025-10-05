"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getStudioContext } from '@/lib/supabase/queries';
import { initializeCreativeStudio } from '@/lib/n8n/client';
import type { StudioContext } from '@/types/database';

interface TaraStudioContextType {
  context: StudioContext | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const TaraStudioContext = createContext<TaraStudioContextType | undefined>(undefined);

export function TaraStudioProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<StudioContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch context from server endpoint which uses service role client
      const resp = await fetch('/api/studio/refresh-context');
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        // Try initialization via n8n if not initialized
        try {
          await initializeCreativeStudio();
          const retry = await fetch('/api/studio/refresh-context');
          const retryJson = await retry.json();
          if (!retryJson?.success) throw new Error('Failed to initialize studio context');
          setContext(retryJson.context);
        } catch (initErr: any) {
          console.error('Failed to initialize studio via n8n:', initErr);
          setError(initErr?.message || String(initErr));
          setContext(null);
        }
      } else {
        setContext(json.context);
      }
    } catch (err: any) {
      console.error('Failed to fetch studio context', err);
      setError(err?.message || String(err));
      setContext(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);
  // Lightweight polling to refresh context so cached narratives and proposals show up quickly
  useEffect(() => {
    const iv = setInterval(() => { void refresh(); }, 10_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <TaraStudioContext.Provider value={{ context, isLoading, error, refresh }}>
      {children}
    </TaraStudioContext.Provider>
  );
}

export function useTaraStudio() {
  const ctx = useContext(TaraStudioContext);
  if (!ctx) throw new Error('useTaraStudio must be used within a TaraStudioProvider');
  return ctx;
}

export default TaraStudioContext;
