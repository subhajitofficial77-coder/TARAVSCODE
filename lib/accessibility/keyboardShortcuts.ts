import { useEffect } from 'react';

type ShortcutHandler = (e: KeyboardEvent) => void;
export type Shortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description?: string;
  handler: ShortcutHandler;
};

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        const ctrlMatch = s.ctrl ? (e.ctrlKey || e.metaKey) : !s.ctrl;
        const shiftMatch = s.shift ? e.shiftKey : !s.shift;
        const altMatch = s.alt ? e.altKey : !s.alt;
        if (e.key === s.key && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          s.handler(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export const TARA_SHORTCUTS: Shortcut[] = [
  { key: 'g', ctrl: true, description: 'Generate content', handler: () => {} },
  { key: 'k', ctrl: true, description: 'Focus chat input', handler: () => {} },
  { key: '/', description: 'Show keyboard shortcuts', handler: () => {} },
  { key: 'Escape', description: 'Close modal', handler: () => {} },
];
