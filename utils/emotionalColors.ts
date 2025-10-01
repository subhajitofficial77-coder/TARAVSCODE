export type EmotionKey = 'joy'|'anger'|'sadness'|'fear'|'trust'|'surprise'|'disgust'|'anticipation';

export const EMOTION_COLORS: Record<EmotionKey,string> = {
  joy: '#FFD700', anger: '#FF4444', sadness: '#4A90E2', fear: '#9B59B6', trust: '#2ECC71', surprise: '#FFA500', disgust: '#8B4513', anticipation: '#00CED1'
};

export function getEmotionColor(emotion: EmotionKey) {
  return EMOTION_COLORS[emotion];
}
