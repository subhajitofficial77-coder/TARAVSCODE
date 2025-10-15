"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useTaraStudio } from '@/lib/contexts/TaraStudioContext';
import { useEmotionalStyling } from '@/lib/hooks/useEmotionalStyling';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import DottedSurface from './DottedSurface';

interface Props {
  mode?: 'gradient' | 'particle' | 'auto';
  className?: string;
}

export default function StudioAmbiance({ mode = 'auto', className }: Props) {
  const { context, isLoading } = useTaraStudio();
  const { dominantEmotion, intensity, topEmotions } = useEmotionalStyling();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Declare all state hooks unconditionally at the top level
  const [primary, setPrimary] = React.useState('#FFD700');
  const [secondary, setSecondary] = React.useState('#2ECC71');
  const [tertiary, setTertiary] = React.useState('#4A90E2');

  const useParticle = mode === 'particle' || (mode === 'auto' && !isMobile);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = getComputedStyle(document.documentElement);
    const p = root.getPropertyValue('--studio-primary-color') || '#FFD700';
    const s = root.getPropertyValue('--studio-secondary-color') || '#2ECC71';
    const t = root.getPropertyValue('--studio-tertiary-color') || '#4A90E2';
    setPrimary(p.trim());
    setSecondary(s.trim());
    setTertiary(t.trim());
  }, [dominantEmotion, intensity, topEmotions]);

  // if particle mode, render immediately (no document reads)
  if (useParticle) {
    return <DottedSurface className={className} mode="particle" />;
  }

  const bg = `radial-gradient(circle at 30% 30%, ${primary}40, ${secondary}30)`;
  const blob = `radial-gradient(circle, ${tertiary}50, transparent)`;

  return (
    <motion.div aria-hidden className={`pointer-events-none fixed inset-0 -z-10 studio-ambiance ${className ?? ''}`} style={{ background: bg }}>
      <motion.div className="absolute inset-0 opacity-60 bg-noise" />
      <motion.div className="absolute -left-20 -top-20 w-96 h-96 rounded-full animate-studio-drift" style={{ background: blob, opacity: 0.6, filter: 'blur(40px)' }} />
    </motion.div>
  );
}
