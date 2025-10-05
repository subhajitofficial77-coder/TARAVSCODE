"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { getEmotionalState, getRelationships, getChatHistory } from '@/lib/supabase/queries';
import { createBrowserClient } from '@/lib/supabase/client';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import SentientStatusPanel from '@/components/dashboard/SentientStatusPanel';
import { Sparkles } from 'lucide-react';
import DailyPlanPanel from '@/components/dashboard/DailyPlanPanel';
import ChatInterface from '@/components/dashboard/ChatInterface';
import ContentFeedbackPanel from '@/components/dashboard/ContentFeedbackPanel';
import AnimatedSection from '@/components/dashboard/AnimatedSection';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import APIErrorBoundary from '@/components/errors/APIErrorBoundary';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useKeyboardShortcuts } from '@/lib/accessibility/keyboardShortcuts';
import { useAnnouncer } from '@/lib/accessibility/announcer';
import useRealtimeEmotionalState from '@/lib/hooks/useRealtimeEmotionalState';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import EmotionalBadge from '@/components/dashboard/EmotionalBadge';
import BackgroundPaths from '@/components/dashboard/BackgroundPaths';
import { useState as useLocalState } from 'react';
import ContextDebugPanel from '@/components/dashboard/ContextDebugPanel';

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function DashboardPage() {
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const { emotionalState, isLoading: realtimeLoading, error: realtimeError } = useRealtimeEmotionalState();
  const [relationships, setRelationships] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useLocalState(false);

  const { refresh: refreshStudio } = useTaraStudio();

  async function fetchAll() {
    try {
      const [es, rels, chat] = await Promise.all([
        getEmotionalState(supabase),
        getRelationships(supabase),
        getChatHistory(supabase)
      ]);
      // set only if available
      if (rels) setRelationships(rels);
      if (chat) setChatHistory(chat);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    }
  }

  useEffect(() => { void fetchAll(); }, []);

  useEffect(() => {
    if (realtimeError) {
      toast.error('Real-time connection error');
    }
    if (!realtimeLoading && emotionalState) {
      toast.success("TARA's consciousness connected");
    }
  }, [realtimeLoading, realtimeError, emotionalState]);

  const { announce } = useAnnouncer();
  useEffect(() => {
    if (emotionalState) {
      announce?.(`TARA emotional state: ${JSON.stringify(emotionalState)}`);
    }
  }, [emotionalState, announce]);

  useKeyboardShortcuts([
    { key: 'k', ctrl: true, description: 'Focus chat input', handler: () => { chatInputRef.current?.focus(); } },
  ]);

  return (
    <main className="min-h-screen relative overflow-hidden bg-tara-bg-dark p-4 md:p-8" aria-label="TARA Command Deck Dashboard">
      {/* animated SVG background paths */}
      <BackgroundPaths />
      {/* subtle noise overlay */}
      <div className="absolute inset-0 z-0 bg-noise opacity-6 pointer-events-none" />

      <a href="#chat-interface" className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-white/10 text-white px-3 py-2 rounded">Skip to chat</a>

      <div className="max-w-7xl mx-auto relative z-10 panel-vignette">
        <DashboardHeader />

        <div className="flex items-center justify-between">
          <EmotionalBadge label={emotionalState?.dominant ? `${emotionalState.dominant} (${Math.round((emotionalState.intensity||0)*100)}%)` : 'Joyful (85%)'} />

          {/* Dev-only control: simulate a life event */}
          {((typeof window !== 'undefined') && (window.location.hostname === 'localhost')) || process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === 'true' ? (
            <div className="ml-4">
              <button
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/6 hover:bg-white/10 text-sm rounded shadow"
                disabled={isSimulating}
                onClick={async () => {
                  try {
                      setIsSimulating(true);
                      const res = await fetch('/api/simulate-life-event', { method: 'POST' });
                      const data = await res.json();
                      if (!res.ok || !data?.ok) {
                        console.error('Simulation failed', data);
                        toast.error('Simulation failed');
                      } else {
                        toast.success(`Simulated: ${data.event ?? 'Unnamed event'}`);
                        // Refresh studio context and dashboard data so UI components update
                        try {
                          if (refreshStudio) await refreshStudio();
                        } catch (e) {
                          console.warn('Studio refresh after simulation failed', e);
                        }
                        // Re-fetch relationships/chat to keep local state in sync
                        try { await fetchAll(); } catch (e) { /* ignore */ }
                        // Notify other UI parts (daily-plan) to refresh
                        try {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('tara:simulation', { detail: { timestamp: data.timestamp || Date.now() } }));
                          }
                        } catch (e) { /* ignore */ }
                      }
                    } catch (e) {
                      console.error('Simulate API error', e);
                      toast.error('Simulation error');
                    } finally {
                      setIsSimulating(false);
                    }
                }}
              >
                {isSimulating ? 'Simulating...' : 'Simulate life event'}
              </button>
            </div>
          ) : null}
        </div>

        {/* Debug: toggle context panel (dev-only) */}
        {((typeof window !== 'undefined') && (window.location.hostname === 'localhost')) || process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === 'true' ? (
          <div className="mt-4">
            <ContextDebugPanel endpoint="/api/studio/tara-context" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedSection>
            <ErrorBoundary>
              <div id="sentient-status" tabIndex={-1}>
                <SentientStatusPanel emotionalState={emotionalState} relationships={relationships} />
              </div>
            </ErrorBoundary>
          </AnimatedSection>

          <AnimatedSection animation="slide">
            <ErrorBoundary>
              <div id="daily-plan" tabIndex={-1}>
                <DailyPlanPanel />
              </div>
            </ErrorBoundary>
          </AnimatedSection>
        </div>

        <div className="mt-6">
          <AnimatedSection>
            <ErrorBoundary>
              <div id="content-feedback" tabIndex={-1}>
                <div className="glass rounded-2xl p-6 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">TARA's Creative Studio</h3>
                  <p className="text-sm text-white/60 mb-4">Enter TARA's living creative space. Collaborate with her on content inspired by her daily plans, emotions, and consciousness.</p>
                  <a href="/creative-studio" className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-full border border-yellow-400/30 hover:bg-yellow-400/30 transition-all duration-200"><Sparkles className="w-4 h-4" /> Enter TARA's Studio</a>
                </div>
              </div>
            </ErrorBoundary>
          </AnimatedSection>
        </div>

        <div className="mt-6">
          <AnimatedSection animation="fade">
            <APIErrorBoundary>
              <div className="glass rounded-2xl p-6 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Conversation with TARA</h3>
                <p className="text-sm text-white/60 mb-4">Move to the dedicated conversation page for an immersive chat experience.</p>
                <a href="/conversation" className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-full border border-yellow-400/30">Open Conversation</a>
              </div>
            </APIErrorBoundary>
          </AnimatedSection>
        </div>

        <div className="fixed top-6 right-6">
          <ThemeToggle />
        </div>
      </div>

      <Toaster position="top-right" />
    </main>
  );
}
