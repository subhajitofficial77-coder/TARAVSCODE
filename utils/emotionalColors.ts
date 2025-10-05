export type EmotionKey = 'joy'|'anger'|'sadness'|'fear'|'trust'|'surprise'|'disgust'|'anticipation';

export const EMOTION_COLORS: Record<EmotionKey,string> = {
  joy: '#FFD700', anger: '#FF4444', sadness: '#4A90E2', fear: '#9B59B6', trust: '#2ECC71', surprise: '#FFA500', disgust: '#8B4513', anticipation: '#00CED1'
};

// A small palette of fallback colors for emotions not present in EMOTION_COLORS.
const FALLBACK_COLORS = ['#E5E7EB', '#F97316', '#60A5FA', '#34D399', '#F472B6', '#A78BFA', '#FBBF24', '#94A3B8'];

/**
 * Get a stable hex color for any emotion key. If the emotion is known in EMOTION_COLORS,
 * return that. Otherwise pick a deterministic fallback from FALLBACK_COLORS using a hash.
 */
export function getEmotionColor(emotion: string): string {
  if (!emotion) return FALLBACK_COLORS[0];
  const key = emotion as EmotionKey;
  if ((EMOTION_COLORS as Record<string,string>)[key]) return (EMOTION_COLORS as Record<string,string>)[key];

  // deterministic hash to pick a fallback color
  let h = 0;
  for (let i = 0; i < emotion.length; i++) {
    h = (h << 5) - h + emotion.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[idx];
}
