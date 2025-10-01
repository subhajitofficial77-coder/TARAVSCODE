"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatRelativeTime, truncateContentPreview } from '@/utils/formatters';
import type { MockContentItem, FeedbackAction } from '@/types/feedback';

interface Props {
  content: MockContentItem;
  onFeedbackSubmit?: (contentId: string, action: FeedbackAction) => void;
}

export default function ContentCard({ content, onFeedbackSubmit }: Props) {
  const [localFeedback, setLocalFeedback] = useState<FeedbackAction | null>(content.user_feedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleFeedback(action: FeedbackAction) {
    if (localFeedback) return; // already submitted
    setLocalFeedback(action);
    setIsSubmitting(true);
    toast.loading('Submitting feedback...');
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contentId: content.id, action }) });
      const json = await res.json();
      if (json.success) {
        toast.dismiss();
        toast.success(json.message || 'Feedback recorded');
        onFeedbackSubmit?.(content.id, action);
      } else {
        toast.dismiss();
        toast.error(json.error || 'Failed to submit feedback');
        // rollback
        setLocalFeedback(content.user_feedback || null);
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error('Network error');
      setLocalFeedback(content.user_feedback || null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const preview = truncateContentPreview(content.content_data?.text || '', 220);

  return (
    <motion.article role="article" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-white/60">{content.content_type}</div>
          <div className="mt-2 text-gray-100">{preview}</div>
          <div className="mt-3 text-xs text-white/50">{formatRelativeTime(content.created_at || new Date().toISOString())}</div>
        </div>
        <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
          {!localFeedback && (
            <div className="flex gap-2">
              <button aria-label="Accept this content" onClick={() => handleFeedback('accepted')} disabled={isSubmitting} className="px-3 py-2 rounded-full bg-green-500 text-white flex items-center gap-2">
                <ThumbsUp size={16} /> Accept
              </button>
              <button aria-label="Reject this content" onClick={() => handleFeedback('rejected')} disabled={isSubmitting} className="px-3 py-2 rounded-full bg-red-600 text-white flex items-center gap-2">
                <ThumbsDown size={16} /> Reject
              </button>
            </div>
          )}

          {localFeedback === 'accepted' && (
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle /> Accepted
            </div>
          )}

          {localFeedback === 'rejected' && (
            <div className="flex items-center gap-2 text-red-300">
              <XCircle /> Feedback noted
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
