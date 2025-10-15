export interface EmotionalStyle {
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

export interface EmotionalAnimationStyle {
  className: string;
  duration: string;
  scale: string;
  opacity: string;
}

export interface EmotionColor {
  bgClass: string;
  textClass: string;
  borderClass: string;
  glowClass: string;
}

export type Emotions = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';