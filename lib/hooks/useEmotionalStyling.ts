"use client";
import { useEffect, useContext } from 'react';
import TaraStudioContext from '@/lib/contexts/TaraStudioContext';
import { EMOTION_COLORS } from '@/utils/emotionalColors';
import type { PrimaryEmotions } from '@/types/database';
import type { EmotionalStyle } from '@/types/emotional';

export { type EmotionalStyle };

interface EmotionalStyle {
  containerStyle: string;
  customStyle?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animation: {
    duration: string;
    scale: string;
    opacity: string;
  };
  gradient: string;
  border: string;
  shadow: string;
  textStyle: string;
}

function getDominantEmotion(emotions?: PrimaryEmotions) {
  if (!emotions) return 'joy';
  const entries = Object.entries(emotions) as [keyof PrimaryEmotions, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return (entries[0] && entries[0][0]) || 'joy';
}

function getEmotionIntensity(emotions?: PrimaryEmotions, emotion?: keyof PrimaryEmotions) {
  if (!emotions || !emotion) return 0.5;
  return Math.max(0, Math.min(1, emotions[emotion] ?? 0.5));
}

function getTopEmotions(emotions?: PrimaryEmotions, count = 3) {
  if (!emotions) return ['joy', 'trust', 'sadness'];
  return Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map((e) => e[0]);
}

export function useEmotionalStyling() {
  // prefer safe context access; if provider missing, fall back to defaults
  const maybe = useContext(TaraStudioContext as any) as any | undefined;
  const context = maybe?.context ?? null;
  const isLoading = maybe?.isLoading ?? false;
  const emotions = context?.emotional_state?.primary_emotions;
  const mood = context?.emotional_state?.mood;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement.style;
    const dominant = getDominantEmotion(emotions) as string;
    const top = getTopEmotions(emotions, 3) as string[];
    const intensity = getEmotionIntensity(emotions, top[0] as any) ?? 0.5;

  const primary = EMOTION_COLORS[dominant as keyof typeof EMOTION_COLORS] ?? '#FFD700';
  const secondary = EMOTION_COLORS[(top[1] ?? 'trust') as keyof typeof EMOTION_COLORS] ?? '#2ECC71';
  const tertiary = EMOTION_COLORS[(top[2] ?? 'sadness') as keyof typeof EMOTION_COLORS] ?? '#4A90E2';

    root.setProperty('--studio-primary-color', primary);
    root.setProperty('--studio-secondary-color', secondary);
    root.setProperty('--studio-tertiary-color', tertiary);
    root.setProperty('--studio-intensity', String(intensity));

    // map energy to animation speed (inverse: higher energy => faster => smaller duration)
  // Map energy to animation speed and scale effects
    const energy = mood?.energy_level ?? 0.5;
    const speed = Math.max(0.5, 3 - energy * 2.5); // 0.5s - 3s
    const scale = 1 + (energy - 0.5) * 0.1; // 0.95 - 1.05 scale
    root.setProperty('--studio-animation-speed', `${speed}s`);
    root.setProperty('--studio-scale-factor', String(scale));

    // Enhanced glow and blur effects based on intensity
    const glow = Math.round(10 + intensity * 30);
    const blur = Math.round(intensity * 5);
    root.setProperty('--studio-glow-radius', `${glow}px`);
    root.setProperty('--studio-blur-effect', `${blur}px`);
    root.setProperty('--studio-opacity', String(0.7 + intensity * 0.3));

    // Enhanced wave and movement effects
    const amp = Math.round(20 + intensity * 80);
    const freq = Math.max(1, 3 - intensity * 2); // Higher intensity = faster waves
    root.setProperty('--studio-wave-amplitude', String(amp));
    root.setProperty('--studio-wave-frequency', `${freq}s`);
    root.setProperty('--studio-movement-range', `${Math.round(intensity * 20)}px`);
  }, [context?.emotional_state?.primary_emotions, mood, isLoading]);

  const dominantEmotion = getDominantEmotion(emotions);
  const intensity = getEmotionIntensity(emotions, dominantEmotion as any);
  const topEmotions = getTopEmotions(emotions, 3);

  const getEmotionalStyle = (baseStyle: string = ''): EmotionalStyle => {
    const dominant = EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS];
    const colors = topEmotions.map(e => EMOTION_COLORS[e as keyof typeof EMOTION_COLORS]);
    
    return {
      containerStyle: `emotional-element transition-all duration-[var(--studio-animation-speed)] transform hover:scale-[var(--studio-scale-factor)] bg-opacity-[var(--studio-opacity)] ${baseStyle}`,
      colors: {
        primary: EMOTION_COLORS[dominantEmotion as keyof typeof EMOTION_COLORS],
        secondary: EMOTION_COLORS[topEmotions[1] as keyof typeof EMOTION_COLORS] || '#2ECC71',
        accent: EMOTION_COLORS[topEmotions[2] as keyof typeof EMOTION_COLORS] || '#4A90E2'
      },
      animation: {
        duration: `var(--studio-animation-speed)`,
        scale: `var(--studio-scale-factor)`,
        opacity: `var(--studio-opacity)`
      },
      gradient: `bg-gradient-to-br from-[${colors[0]}] via-[${colors[1]}] to-[${colors[2]}]`,
      border: `border-2 border-[${dominant}]`,
      shadow: `shadow-[0_0_var(--studio-glow-radius)_${dominant}]`,
      textStyle: `transition-all duration-[var(--studio-animation-speed)] text-[${dominant}]`
    };
  };

  const getEmotionalAnimation = (baseAnimation: string = '') => {
    return {
      className: `${baseAnimation} animate-[wave_var(--studio-wave-frequency)_ease-in-out_infinite] motion-safe:transform-gpu`,
      duration: `var(--studio-wave-frequency)`,
      scale: `var(--studio-scale-factor)`,
      opacity: `var(--studio-opacity)`
    };
  };

  return {
    // Core emotional state
    dominantEmotion,
    intensity,
    topEmotions,
    mood,
    // Styling helpers with rich objects
    getEmotionalStyle,
    getEmotionalAnimation,
    // Helper method to get combined styles
    getCombinedStyle: (baseStyle: string = '') => {
      const style = getEmotionalStyle(baseStyle);
      return style.containerStyle;
    }
  };
}
