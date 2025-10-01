import { useCallback } from 'react';

export function useAnnouncer() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (typeof document === 'undefined') return;
    let live = document.getElementById(`aria-live-${priority}`) as HTMLElement | null;
    if (!live) {
      live = document.createElement('div');
      live.id = `aria-live-${priority}`;
      live.setAttribute('aria-live', priority);
      live.setAttribute('aria-atomic', 'true');
      live.className = 'sr-only';
      document.body.appendChild(live);
    }
    live.textContent = '';
    setTimeout(() => {
      live!.textContent = message;
    }, 100);
  }, []);

  return { announce };
}

export const TARA_ANNOUNCEMENTS = {
  emotionalUpdate: (emotion: string) => `TARA's emotional state updated. Now feeling ${emotion}.`,
  contentGenerated: (type: string) => `${type} content generated successfully.`,
  feedbackReceived: (action: string) => `Feedback ${action}. TARA's emotions updated.`,
  chatResponse: () => 'TARA responded to your message.',
  error: (message: string) => `Error: ${message}`,
};
