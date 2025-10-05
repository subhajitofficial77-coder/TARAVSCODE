"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sparkles, Edit3 } from 'lucide-react';
import type { GeneratedContent } from '@/types/database';

type Props = {
  open: boolean;
  item: GeneratedContent | null;
  onClose: () => void;
  onSave: (updated: GeneratedContent, regenerate: boolean, notes: string) => void;
};

export default function RefineModal({ open, item, onClose, onSave }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [refinementNotes, setRefinementNotes] = useState<string>('');
  const [regenerateMode, setRegenerateMode] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(JSON.stringify(item?.content_data ?? {}, null, 2));
    setRefinementNotes('');
    setParseError(null);
    setRegenerateMode(false);
  }, [item, open]);

  // focus trap: when modal opens, save previously focused element and move focus
  // into the dialog. While open, trap Tab/Shift+Tab within the dialog. On close,
  // restore focus to the previously focused element.
  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      // move focus to first focusable element inside dialog after render
      requestAnimationFrame(() => {
        const el = dialogRef.current;
        if (!el) return;
        const focusable = el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        } else {
          el.focus();
        }
      });
    } else {
      // restore focus
      if (previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (regenerateMode) {
          if (refinementNotes.trim()) onSave(item as GeneratedContent, true, refinementNotes.trim());
        } else {
          try {
            const parsed = JSON.parse(draft || '{}');
            onSave({ ...(item as GeneratedContent), content_data: parsed } as GeneratedContent, false, '');
          } catch (err) {
            setParseError('Invalid JSON format');
          }
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, draft, refinementNotes, regenerateMode, item, onClose, onSave]);

  // trap Tab focus within the dialog
  useEffect(() => {
    if (!open) return;
    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const el = dialogRef.current;
      if (!el) return;
      const focusable = Array.from(el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )).filter((n) => n.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refine-title"
            aria-describedby="refine-desc"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={dialogRef}
            tabIndex={-1}
            className="glass rounded-2xl p-6 w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 id="refine-title" className="text-xl font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Refine Content
                </h3>
                <p id="refine-desc" className="text-sm text-white/60 mt-1">Edit manually or regenerate with TARA's help</p>
              </div>
              <button aria-label="Close" onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => setRegenerateMode(false)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${!regenerateMode ? 'bg-white/10 text-white' : 'text-white/60'}`}
              >
                <Edit3 className="w-4 h-4 inline mr-2" /> Edit Manually
              </button>
              <button
                onClick={() => setRegenerateMode(true)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${regenerateMode ? 'bg-white/10 text-white' : 'text-white/60'}`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" /> Regenerate with TARA
              </button>
            </div>

            {!regenerateMode ? (
              <div>
                <label className="text-sm text-white/70 mb-2 inline-flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Content Data (JSON)
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setParseError(null);
                  }}
                  className="w-full h-96 p-4 bg-black/40 border border-white/10 rounded-lg text-white font-mono text-sm resize-none focus:outline-none focus:border-white/30"
                />
                {parseError ? <div className="text-red-400 text-sm mt-2">{parseError}</div> : null}
                <div className="text-xs text-white/50 mt-2">Manually edit the content structure. Changes will be saved when you click Save.</div>
              </div>
            ) : (
              <div>
                <label className="text-sm text-white/70 mb-2 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Refinement Notes for TARA
                </label>
                <textarea
                  value={refinementNotes}
                  onChange={(e) => setRefinementNotes(e.target.value)}
                  className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-white/30"
                  placeholder="Tell TARA what to improve... (e.g., 'Make it wittier', 'Add more emotion', 'Focus on the first slide')"
                />

                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xs text-white/50">Original Content</div>
                  <pre className="text-sm text-white/70 mt-2 max-h-40 overflow-auto">{JSON.stringify(item?.content_data ?? {}, null, 2).slice(0, 1000)}</pre>
                </div>
                <div className="text-xs text-white/50 mt-2">TARA will regenerate this content based on your notes and her current emotional state.</div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg">Cancel</button>
              {!regenerateMode ? (
                <button
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(draft || '{}');
                      onSave({ ...(item as GeneratedContent), content_data: parsed } as GeneratedContent, false, '');
                    } catch (err) {
                      setParseError('Invalid JSON format');
                    }
                  }}
                  className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              ) : (
                <button
                  disabled={!refinementNotes.trim()}
                  onClick={() => onSave(item as GeneratedContent, true, refinementNotes.trim())}
                  className="px-4 py-2 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" /> Regenerate with TARA
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
