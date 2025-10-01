"use client";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import ContentPreviewCard from '@/components/content/ContentPreviewCard';
import ContentCarousel from '@/components/content/ContentCarousel';
import ContentGenerationPanel from '@/components/content/ContentGenerationPanel';
import ContentEditModal from '@/components/content/ContentEditModal';
import { getGeneratedContent, updateGeneratedContent } from '@/lib/supabase/queries';
import { createBrowserClient } from '@/lib/supabase/client';
import type { GeneratedContent } from '@/types/database';
import type { FeedbackAction } from '@/types/feedback';

const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function ContentFeedbackPanel() {
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<GeneratedContent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      try {
        const real = await getGeneratedContent(supabase, 20);
        if (mounted && real) setItems(real as GeneratedContent[]);
        else setItems([]);
      } catch (e) {
        console.error('load generated content error', e);
        setItems([]);
        toast('Using sample content due to fetch error', { icon: '⚠️' });
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
      // Expecting { success, message, emotionalImpact }
      if (!body?.success) {
        toast.error(body?.error || 'Failed to record feedback');
        return;
      }

      // Update local item state to reflect submitted feedback
      setItems(prev => prev.map(it => it.id === contentId ? { ...it, user_feedback: action } : it));

      // If the API returned emotionalImpact, we can optionally show a toast or update client-side state elsewhere
      if (body.emotionalImpact) {
        toast.success("Feedback recorded! TARA's emotional state adjusted.");
        // Optionally: emit an event or call a local handler here to update in-memory emotional state
      } else {
        toast.success('Feedback recorded!');
      }
    } catch (err) {
      console.error('feedback submit error', err);
      toast.error('Failed to record feedback');
    }
  }

  function handleOpenEdit(item: GeneratedContent) {
    setEditing(item);
    setModalOpen(true);
  }

  async function handleSaveEdit(updated: GeneratedContent) {
    try {
      const saved = await updateGeneratedContent(supabase as any, updated.id, { content_data: updated.content_data });
      if (saved) {
        setItems(prev => prev.map(it => it.id === saved.id ? saved : it));
        toast.success('Content updated');
        setModalOpen(false);
      } else {
        toast.error('Failed to save');
      }
    } catch (err) {
      console.error('save edit error', err);
      toast.error('Error saving edit');
    }
  }

  function handleContentGenerated(item: GeneratedContent) {
    setItems(prev => [item as any, ...prev]);
  }

  return (
    <section role="region" aria-label="Content feedback panel" className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Content Studio</h2>
          <p className="text-sm text-white/60">Generate, preview, and improve TARA's creative outputs</p>
        </div>
        <div className="text-xs text-white/50">Phase 7: Content Generation</div>
      </div>

      <div className="space-y-6">
        {/* Always show the generation panel so users can create content on empty DB */}
        <ContentGenerationPanel onContentGenerated={handleContentGenerated} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-white/3 rounded animate-pulse" />
            <div className="h-40 bg-white/3 rounded animate-pulse" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-white/60">No content available</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm text-white/70 mb-2">Carousel Previews</h3>
              <ContentCarousel items={items} />
            </div>

            <div>
              <h3 className="text-sm text-white/70 mb-2">Other Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.filter(i => i.content_type !== 'carousel').map(it => (
                  <div key={it.id}>
                    <ContentPreviewCard item={{ contentType: it.content_type as any, platform: it.platform || 'instagram', data: it.content_data }} onEdit={() => handleOpenEdit(it)} />
                    <div className="mt-2">
                      <div className="text-xs text-white/60">Feedback: {it.user_feedback ?? 'none'}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleFeedbackSubmit(it.id, 'accepted')} className="px-3 py-1 bg-green-500 text-white rounded">Accept</button>
                        <button onClick={() => handleFeedbackSubmit(it.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ContentEditModal open={modalOpen} item={editing} onClose={() => setModalOpen(false)} onSave={handleSaveEdit} />
      </div>
    </section>
  );
}
