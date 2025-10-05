export type EmotionValue = { [key: string]: number };

export interface InspirationSeed {
  id: string;
  type: 'carousel' | 'story' | 'post' | 'caption' | 'prompt';
  label: string;
  topic: string;
  priority: number;
  platform?: 'instagram' | 'twitter' | 'linkedin';
  emotional_context?: EmotionValue;
  estimatedTime?: number;
  method?: 'n8n' | 'local';
}

export interface DailyQuota {
  [key: string]: {
    used: number;
    total: number;
  };
}

export interface MasterPlan {
  id: string;
  date: string;
  theme: string;
  narrative: string;
  inspiration_seeds: InspirationSeed[];
  daily_quota: DailyQuota;
  emotional_context: EmotionValue;
}