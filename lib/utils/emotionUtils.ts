import { type Emotions } from '@/types/emotional';

export type EmotionColor = {
  bg: string;
  text: string;
  border: string;
};

const emotionBaseColors: Record<string, EmotionColor> = {
  joy: {
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-300',
    border: 'border-yellow-500/30'
  },
  trust: {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-500/30'
  },
  anticipation: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-300',
    border: 'border-orange-500/30'
  },
  surprise: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/30'
  },
  sadness: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/30'
  },
  fear: {
    bg: 'bg-gray-500/20',
    text: 'text-gray-300',
    border: 'border-gray-500/30'
  },
  anger: {
    bg: 'bg-red-500/20',
    text: 'text-red-300',
    border: 'border-red-500/30'
  },
  disgust: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30'
  }
};

export function getEmotionalColor(emotion: string): EmotionColor {
  return emotionBaseColors[emotion] || {
    bg: 'bg-gray-500/20',
    text: 'text-gray-300',
    border: 'border-gray-500/30'
  };
}

export function getEmotionalGradient(emotions: Emotions): string {
  const sortedEmotions = Object.entries(emotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (sortedEmotions.length === 0) return 'bg-gradient-to-r from-gray-800 to-gray-900';

  const stops = sortedEmotions.map(([emotion], index) => {
    const color = emotionBaseColors[emotion] || emotionBaseColors.neutral;
    const position = index * 33; // Evenly space 3 colors
    return `${color.bg.replace('bg-', '')} ${position}%`;
  });

  return `bg-gradient-to-r from-${stops[0]} ${
    stops[1] ? `via-${stops[1]}` : ''
  } to-${stops[2] || stops[0]}`;
}