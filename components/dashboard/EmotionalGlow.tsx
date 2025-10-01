"use client";
import React from 'react';
import { motion } from 'framer-motion';

type EmotionalState = any;

function getDominantEmotion(primary: any) {
  if (!primary) return 'joy';
  let best = 'joy';
  let val = -Infinity;
  for (const k of Object.keys(primary)) {
    if (primary[k] > val) {
      val = primary[k];
      best = k;
    }
  }
  return best;
}

function getEmotionColor(e: string) {
  const map: Record<string,string> = {
    joy: '#FFD700', anger: '#FF4444', sadness: '#4A90E2', fear: '#9B59B6', trust: '#2ECC71', surprise: '#FFA500', disgust: '#8B4513', anticipation: '#00CED1'
  };
  return map[e] || '#FFD700';
}

export default function EmotionalGlow({ emotionalState }: { emotionalState: EmotionalState | null }) {
  const dominant = getDominantEmotion(emotionalState?.primary_emotions || {});
  const color = getEmotionColor(dominant);
  const intensity = ((emotionalState?.primary_emotions?.[dominant] ?? 0) * 0.7) + 0.3;

  return (
    <motion.div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/5" animate={{ backgroundColor: color }} transition={{ duration: 1.5 }}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-transparent opacity-20 blur-3xl" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <p className="text-sm uppercase tracking-wider opacity-70">Dominant Emotion</p>
        <p className="text-3xl font-bold capitalize">{dominant}</p>
        <p className="text-sm opacity-70">{Math.round((emotionalState?.primary_emotions?.[dominant] ?? 0) * 100)}%</p>
      </div>
    </motion.div>
  );
}
