/**
 * Primary emotions, ranged 0-1
 */
export interface PrimaryEmotions {
  joy: number;
  trust: number;
  fear: number;
  surprise: number;
  sadness: number;
  disgust: number;
  anger: number;
  confidence: number;
  anticipation: number;
}

export interface Mood {
  optimism: number;
  energy_level: number;
  stress_level: number;
}

export interface CoreTraits {
  warmth: number;
  wit: number;
  ambition: number;
}

export interface EmotionalState {
  id: string;
  primary_emotions: PrimaryEmotions;
  mood: Mood;
  core_traits: CoreTraits;
  last_event?: string | null;
  last_event_timestamp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RelationshipType = 'family' | 'friend' | 'colleague' | 'other';
export type RelationshipStatus = 'warm' | 'neutral' | 'strained' | 'excellent';

export interface Relationship {
  id: string;
  entity_name: string;
  relationship_type: RelationshipType;
  status: RelationshipStatus;
  last_interaction?: string | null;
  decay_timer?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ContentType = 'carousel' | 'story' | 'caption' | 'post';

export interface ContentData {
  text?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface GeneratedContent {
  id: string;
  content_type: ContentType;
  content_data: ContentData;
  emotional_context: EmotionalState;
  user_feedback?: 'accepted' | 'rejected' | null;
  platform?: 'instagram' | 'twitter' | 'linkedin' | null;
  created_at?: string;
}

export type ChatRole = 'user' | 'tara' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  message: string;
  emotional_state?: Partial<EmotionalState> | null;
  created_at?: string;
}
