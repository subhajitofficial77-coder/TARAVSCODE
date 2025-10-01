import type { PrimaryEmotions, Mood, EmotionalState } from '@/types/database';

/** Simple per-content feedback action */
export type FeedbackAction = 'accepted' | 'rejected';

/** Request payload sent to /api/feedback */
export interface FeedbackRequest {
  contentId: string;
  action: FeedbackAction;
}

/** Emotional changes produced by feedback */
export interface FeedbackImpact {
  emotions?: Partial<PrimaryEmotions>;
  mood?: Partial<Mood>;
}

/** Response returned by /api/feedback */
export interface FeedbackResponse {
  success: boolean;
  message: string;
  emotionalImpact?: FeedbackImpact;
  error?: string;
}

/** Mock content item for Phase 6 testing */
export interface MockContentItem {
  id: string;
  content_type: string;
  content_data: {
    text?: string;
    images?: string[];
    hashtags?: string[];
  };
  emotional_context?: EmotionalState;
  user_feedback?: FeedbackAction | null;
  platform?: string | null;
  created_at?: string;
}

/** Internal analysis shape returned by the feedback loop library */
export interface FeedbackAnalysis {
  aggregatedScores?: Record<string, number>;
  suggestion?: string;
  emotionalImpact?: FeedbackImpact;
}
