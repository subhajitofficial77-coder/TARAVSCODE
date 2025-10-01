import type { PrimaryEmotions, Mood, CoreTraits, EmotionalState, Relationship, RelationshipStatus } from './database';

export type EmotionalImpact = Partial<PrimaryEmotions>;

export interface RelationshipImpact {
  entity_name: string;
  status_change: RelationshipStatus;
  decay_hours?: number;
}

export type EventCategory = 'family' | 'social' | 'work' | 'personal' | 'random';

export interface LifeEvent {
  id: string;
  name: string;
  description: string;
  probability: number;
  emotional_impact: EmotionalImpact;
  mood_impact?: Partial<Mood>;
  relationship_impact?: RelationshipImpact[];
  category: EventCategory;
}

export interface SimulationResult {
  newState: EmotionalState;
  event: LifeEvent;
  relationshipUpdates: Relationship[];
  timestamp: string;
  summary?: string;
}

export interface TALEConfig {
  emotion_decay_rate: number;
  mood_inertia_weight: number;
  decay_hours_default: number;
  enable_auto_decay: boolean;
}
