"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import AdvancedCarousel from '@/components/content/AdvancedCarousel';
import InspirationHub from '@/components/content/InspirationHub';
import ContentStreamCard from './ContentStreamCard';
import RefineModal from './RefineModal';
import { getGeneratedContent, updateGeneratedContent } from '@/lib/supabase/queries';
import { createBrowserClient } from '@/lib/supabase/client';
import type { GeneratedContent } from '@/types/database';
import type { FeedbackAction } from '@/types/feedback';

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function CreationStream() {
  const { context } = useTaraStudio();
  const { dominantEmotion } = useEmotionalStyling();

  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refining, setRefining] = useState<GeneratedContent | null>(null);
  const [refineModalOpen, setRefineModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const real = await getGeneratedContent(supabase, 50);
        if (mounted && real) setItems(real as GeneratedContent[]);
        else setItems([]);
      } catch (e) {
        console.error('load generated content error', e);
        setItems([]);
        toast('Failed to load generated content', { icon: '⚠️' });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleFeedbackSubmit(contentId: string, action: FeedbackAction) {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, action })
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error('feedback API error', errBody);
        toast.error(errBody?.error || 'Failed to record feedback');
        return;
      }

      const body = await res.json();
      if (!body?.success) {
        toast.error(body?.error || 'Failed to record feedback');
        return;
      }

      setItems(prev => prev.map(it => it.id === contentId ? { ...it, user_feedback: action } : it));

      if (body.emotionalImpact) {
        toast.success("Feedback recorded! TARA's emotional state adjusted.");
      } else {
        toast.success('Feedback recorded!');
      }
    } catch (err) {
      console.error('feedback submit error', err);
      toast.error('Failed to record feedback');
    }
  }

  function handleOpenRefine(item: GeneratedContent) {
    setRefining(item);
    setRefineModalOpen(true);
  }

  async function handleSaveRefinement(updated: GeneratedContent, regenerate: boolean, notes: string) {
    try {
      if (regenerate) {
        // Ensure platform is non-null (default to 'instagram') when regenerating
        const platform = (updated.platform ?? 'instagram') as NonNullable<typeof updated.platform>;
        // Call generate-content API with parentId and refinementNotes
        const req = { contentType: updated.content_type, platform, parentId: updated.id, refinementNotes: notes } as any;
        const res = await fetch('/api/generate-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) });
        const data = await res.json();
        if (data?.success && data.content) {
          setItems(prev => [data.content as GeneratedContent, ...prev]);
          toast.success("TARA created a refined version");
        } else {
          toast.error('Regeneration failed');
        }
      } else {
        const saved = await updateGeneratedContent(supabase as any, updated.id, { content_data: updated.content_data });
        if (saved) {
          setItems(prev => prev.map(it => it.id === saved.id ? saved : it));
          toast.success('Content updated');
        } else {
          toast.error('Failed to save edits');
        }
      }
    } catch (err) {
      console.error('save refinement error', err);
      toast.error('Error saving refinement');
    } finally {
      setRefineModalOpen(false);
      setRefining(null);
    }
  }

  function handleContentGenerated(item: GeneratedContent) {
    setItems(prev => [item as any, ...prev]);
  }

  const carouselItems = items.filter(i => i.content_type === 'carousel');
  const others = items.filter(i => i.content_type !== 'carousel');

  return (
    <section role="feed" aria-label="TARA's Creation Stream" className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Creation Stream</h2>
          <p className="text-sm text-white/60">Content flowing from TARA's consciousness</p>
        </div>
        <div className="text-xs text-white/50">{items.length} pieces</div>
      </div>

      <div className="space-y-6">
        <InspirationHub onContentGenerated={handleContentGenerated} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-white/3 rounded animate-pulse" />
            <div className="h-40 bg-white/3 rounded animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-white/60">No content in the stream yet. Use the Inspiration Hub above to create with TARA.</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-white/70 mb-2">Carousel Previews</h3>
              <div className="rounded-xl border-2 border-yellow-400/40 p-4 mx-auto" style={{ maxWidth: '760px' }}>
                <AdvancedCarousel items={carouselItems} baseWidth={420} autoplay={false} />
              </div>
            </div>

            <div>
              <h3 className="text-sm text-white/70 mb-2">Creation Stream</h3>
              <AnimatePresence>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {others.map((it, idx) => (
                    <motion.div key={it.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: idx * 0.06 }} layout>
                      <ContentStreamCard item={it} onAccept={(id) => handleFeedbackSubmit(id, 'accepted')} onRefine={(item) => handleOpenRefine(item)} onDiscard={(id) => handleFeedbackSubmit(id, 'rejected')} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <RefineModal open={refineModalOpen} item={refining} onClose={() => { setRefineModalOpen(false); setRefining(null); }} onSave={handleSaveRefinement} />
      </div>
    </section>
  );
}
