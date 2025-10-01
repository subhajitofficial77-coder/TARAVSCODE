"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { getEmotionalState, getRelationships, getChatHistory } from '@/lib/supabase/queries';
import { createBrowserClient } from '@/lib/supabase/client';
import SentientStatusPanel from '@/components/dashboard/SentientStatusPanel';
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

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function DashboardPage() {
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const { emotionalState, isLoading: realtimeLoading, error: realtimeError } = useRealtimeEmotionalState();
  const [relationships, setRelationships] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
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
    fetchAll();
  }, []);

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
    <main className="min-h-screen bg-tara-bg-dark p-4 md:p-8" aria-label="TARA Command Deck Dashboard">
      {/* Page-level skip link to allow keyboard users to jump to chat */}
      <a href="#chat-interface" className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-white/10 text-white px-3 py-2 rounded">Skip to chat</a>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Command Deck</h1>
            <p className="text-white/60">TARA's Consciousness Interface</p>
          </div>
        </header>

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
                <ContentFeedbackPanel />
              </div>
            </ErrorBoundary>
          </AnimatedSection>
        </div>

        <div className="mt-6">
          <AnimatedSection animation="fade">
            <APIErrorBoundary retryAction={async () => {
              try {
                const chat = await getChatHistory(supabase);
                if (chat) setChatHistory(chat);
                toast.success('Chat history refreshed');
              } catch (e) {
                console.error('Retry fetch chat failed', e);
                toast.error('Failed to refresh chat history');
                throw e;
              }
            }}>
              <div id="chat-interface" tabIndex={-1}>
                <ChatInterface ref={chatInputRef} chatHistory={chatHistory} />
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
