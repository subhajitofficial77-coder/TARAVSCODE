"use client";
import { useEffect, useRef, useState } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const last = useRef(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const p = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
        const clamped = Math.max(0, Math.min(1, p));
        setProgress((prev) => {
          if (Math.abs(prev - clamped) < 0.005) return prev;
          return clamped;
        });
        setDirection(window.scrollY > last.current ? 'down' : 'up');
        last.current = window.scrollY;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return { scrollProgress: progress, scrollDirection: direction };
}
