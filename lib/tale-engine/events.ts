/**
 * TALE Life Events Library
 * A comprehensive list of probabilistic life events with emotional and relationship impacts.
 */
import type { PrimaryEmotions, Mood } from '@/types/database';
import type { RelationshipStatus } from '@/types/database';

export interface EmotionalImpact extends Partial<PrimaryEmotions> {}

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
  probability: number; // 0-1
  emotional_impact: EmotionalImpact; // deltas -1..+1
  mood_impact?: Partial<Mood>;
  relationship_impact?: RelationshipImpact[];
  category: EventCategory;
  condition?: (state: any, relationships?: any[]) => boolean; // optional runtime condition
}

// Helper to keep values in realistic delta ranges
function e(v: number) {
  return Math.max(-1, Math.min(1, v));
}

// FAMILY EVENTS (~15)
const FAMILY_EVENTS: LifeEvent[] = [
  {
    id: 'call_with_mom',
    name: 'Call with Mom',
    description: 'A warm, long phone call with Mom filled with affection and advice.',
    probability: 0.30,
    emotional_impact: { joy: e(0.15), trust: e(0.12), anticipation: e(0.07) },
    relationship_impact: [{ entity_name: 'Mother', status_change: 'warm' }],
    category: 'family'
  },
  {
    id: 'fight_with_brother',
    name: 'Fight with Younger Brother',
    description: 'A small argument escalates and leaves hurt feelings.',
    probability: 0.10,
    emotional_impact: { anger: e(0.25), sadness: e(0.15), trust: e(-0.12) },
    relationship_impact: [{ entity_name: 'Younger Brother', status_change: 'strained', decay_hours: 36 }],
    category: 'family'
  },
  {
    id: 'family_dinner',
    name: 'Family Dinner',
    description: 'A cozy dinner with family; nourishing and grounding.',
    probability: 0.20,
    emotional_impact: { joy: e(0.14), trust: e(0.10), anticipation: e(0.08) },
    category: 'family'
  },
  {
    id: 'mom_advice_session',
    name: 'Mom Advice Session',
    description: 'Mom gives thoughtful advice that boosts confidence.',
    probability: 0.15,
    emotional_impact: { trust: e(0.18), joy: e(0.08) },
    mood_impact: { stress_level: -0.12 },
    category: 'family'
  },
  {
    id: 'brother_reconciliation',
    name: 'Brother Reconciliation',
    description: 'A sincere apology and a step towards healing.',
    probability: 0.08,
    emotional_impact: { joy: e(0.18), trust: e(0.2) },
    relationship_impact: [{ entity_name: 'Younger Brother', status_change: 'neutral' }],
    condition: (state, relationships) => {
      const r = (relationships || []).find((x: any) => x.entity_name === 'Younger Brother');
      return !!r && r.status === 'strained';
    },
    category: 'family'
  },
  // additional family events (shorter deltas)
  { id: 'mother_support', name: 'Mother Support', description: 'A small supportive message from Mom.', probability: 0.22, emotional_impact: { joy: e(0.08), trust: e(0.06) }, category: 'family' },
  { id: 'family_photo', name: 'Family Photo Night', description: 'Looking through old family photos.', probability: 0.12, emotional_impact: { joy: e(0.07) }, category: 'family' },
  { id: 'sibling_joke', name: 'Sibling Joke', description: 'A silly moment with siblings.', probability: 0.18, emotional_impact: { joy: e(0.06), surprise: e(0.04) }, category: 'family' },
  { id: 'birthday_message', name: 'Birthday Message', description: 'A heartfelt birthday message arrives.', probability: 0.05, emotional_impact: { joy: e(0.2), trust: e(0.1) }, category: 'family' },
  { id: 'family_argument_resolve', name: 'Family Argument Resolve', description: 'A disagreement is resolved maturely.', probability: 0.06, emotional_impact: { trust: e(0.12), joy: e(0.08) }, category: 'family' }
];

// SOCIAL EVENTS (~15)
const SOCIAL_EVENTS: LifeEvent[] = [
  { id: 'coffee_with_best_friend', name: 'Coffee with Best Friend', description: 'An easy coffee catch-up.', probability: 0.25, emotional_impact: { joy: e(0.18), trust: e(0.15), anticipation: e(0.08) }, relationship_impact: [{ entity_name: 'Best Friend', status_change: 'warm' }], category: 'social' },
  { id: 'made_new_friend', name: 'Made New Friend', description: 'A promising new connection.', probability: 0.05, emotional_impact: { surprise: e(0.18), joy: e(0.15), anticipation: e(0.1) }, category: 'social' },
  { id: 'social_anxiety_moment', name: 'Social Anxiety Moment', description: 'A moment of self-doubt in a social setting.', probability: 0.12, emotional_impact: { fear: e(0.18), sadness: e(0.1) }, mood_impact: { stress_level: 0.08 }, category: 'social' },
  { id: 'party_invitation', name: 'Party Invitation', description: 'An invitation to a social gathering.', probability: 0.18, emotional_impact: { anticipation: e(0.12), joy: e(0.08) }, category: 'social' },
  { id: 'friend_cancelled_plans', name: 'Friend Cancelled Plans', description: 'Plans fall through at the last minute.', probability: 0.15, emotional_impact: { sadness: e(0.12), anger: e(0.08), trust: e(-0.06) }, category: 'social' },
  { id: 'unexpected_praise', name: 'Unexpected Praise', description: 'Someone praises TARA unexpectedly.', probability: 0.10, emotional_impact: { joy: e(0.14), trust: e(0.08) }, category: 'social' },
  { id: 'missed_connection', name: 'Missed Connection', description: 'A near-miss social opportunity.', probability: 0.14, emotional_impact: { sadness: e(0.08), anticipation: e(-0.05) }, category: 'social' },
  { id: 'support_from_friend', name: 'Support from Friend', description: 'A friend provides timely support.', probability: 0.09, emotional_impact: { trust: e(0.16), joy: e(0.1) }, category: 'social' },
  { id: 'awkward_encounter', name: 'Awkward Encounter', description: 'An awkward meeting with an acquaintance.', probability: 0.13, emotional_impact: { sadness: e(0.06) }, category: 'social' },
  { id: 'reconnecting_message', name: 'Reconnecting Message', description: 'A message from someone old sparks warmth.', probability: 0.07, emotional_impact: { joy: e(0.12), surprise: e(0.08) }, category: 'social' }
];

// WORK / CREATIVE EVENTS (~12)
const WORK_EVENTS: LifeEvent[] = [
  { id: 'creative_breakthrough', name: 'Creative Breakthrough', description: 'A sudden burst of creative clarity.', probability: 0.10, emotional_impact: { joy: e(0.22), anticipation: e(0.18), surprise: e(0.12) }, mood_impact: { energy_level: 0.12, stress_level: -0.08 }, category: 'work' },
  { id: 'content_went_viral', name: 'Content Went Viral', description: 'A piece of content gains unexpected traction.', probability: 0.03, emotional_impact: { joy: e(0.3), surprise: e(0.25), anticipation: e(0.2) }, category: 'work' },
  { id: 'creative_block', name: 'Creative Block', description: 'Ideas stall and motivation dips.', probability: 0.20, emotional_impact: { sadness: e(0.18) }, mood_impact: { stress_level: 0.12, energy_level: -0.12 }, category: 'work' },
  { id: 'positive_feedback', name: 'Positive Feedback', description: 'Constructive and positive feedback from peers.', probability: 0.25, emotional_impact: { joy: e(0.14), trust: e(0.1) }, category: 'work' },
  { id: 'harsh_criticism', name: 'Harsh Criticism', description: 'A harsh critique that stings.', probability: 0.08, emotional_impact: { sadness: e(0.18), anger: e(0.12) }, mood_impact: { stress_level: 0.15 }, category: 'work' },
  { id: 'promotion_opportunity', name: 'Promotion Opportunity', description: 'An exciting professional opportunity surfaces.', probability: 0.06, emotional_impact: { anticipation: e(0.2), joy: e(0.12) }, category: 'work' }
];

// PERSONAL EVENTS (~10)
const PERSONAL_EVENTS: LifeEvent[] = [
  { id: 'great_sleep', name: 'Great Sleep', description: 'A deeply restorative night of sleep.', probability: 0.35, emotional_impact: {}, mood_impact: { energy_level: 0.16, optimism: 0.08, stress_level: -0.12 }, category: 'personal' },
  { id: 'insomnia_night', name: 'Insomnia Night', description: 'A restless, sleepless night.', probability: 0.15, emotional_impact: { sadness: e(0.10) }, mood_impact: { stress_level: 0.14, energy_level: -0.12 }, category: 'personal' },
  { id: 'self_reflection_moment', name: 'Self Reflection', description: 'A quiet reflective moment that clarifies values.', probability: 0.20, emotional_impact: { trust: e(0.08), anticipation: e(0.06) }, category: 'personal' },
  { id: 'learned_something_new', name: 'Learned Something New', description: 'Discovering a new concept or skill.', probability: 0.18, emotional_impact: { joy: e(0.12), surprise: e(0.1), anticipation: e(0.08) }, category: 'personal' },
  { id: 'feeling_homesick', name: 'Feeling Homesick', description: 'A pang of longing for familiar places.', probability: 0.10, emotional_impact: { sadness: e(0.14), anticipation: e(0.06) }, mood_impact: { energy_level: -0.06 }, category: 'personal' }
];

// RANDOM EVENTS (~8)
const RANDOM_EVENTS: LifeEvent[] = [
  { id: 'beautiful_sunset', name: 'Beautiful Sunset', description: 'A quiet sunset that lifts the spirit.', probability: 0.12, emotional_impact: { joy: e(0.12), surprise: e(0.08), anticipation: e(0.06) }, category: 'random' },
  { id: 'unexpected_gift', name: 'Unexpected Gift', description: 'A surprise gift brightens the day.', probability: 0.05, emotional_impact: { surprise: e(0.2), joy: e(0.18), trust: e(0.12) }, category: 'random' },
  { id: 'rainy_day_mood', name: 'Rainy Day Mood', description: 'Rainy weather brings introspection.', probability: 0.20, emotional_impact: { sadness: e(0.08) }, mood_impact: { energy_level: -0.06 }, category: 'random' },
  { id: 'nostalgic_song', name: 'Nostalgic Song', description: 'A song triggers a bittersweet memory.', probability: 0.15, emotional_impact: { sadness: e(0.1), joy: e(0.08) }, category: 'random' },
  { id: 'tech_frustration', name: 'Tech Frustration', description: 'A bug causes annoyance and delay.', probability: 0.18, emotional_impact: { anger: e(0.12), disgust: e(0.06) }, mood_impact: { stress_level: 0.08 }, category: 'random' }
];

// Aggregated life events list
export const LIFE_EVENTS: LifeEvent[] = [
  ...FAMILY_EVENTS,
  ...SOCIAL_EVENTS,
  ...WORK_EVENTS,
  ...PERSONAL_EVENTS,
  ...RANDOM_EVENTS
];

export function getEventsByCategory(category: EventCategory) {
  return LIFE_EVENTS.filter((e) => e.category === category);
}

export function getEventById(id: string) {
  return LIFE_EVENTS.find((ev) => ev.id === id) || null;
}

// Weighted random selection: choose by probability but allow no-event outcome if none selected
export function getWeightedRandomEvent(): LifeEvent | null {
  // Normalize probabilities to a sampling list
  const pool: LifeEvent[] = [];
  for (const ev of LIFE_EVENTS) {
    const weight = Math.max(0, Math.round(ev.probability * 100));
    for (let i = 0; i < weight; i++) pool.push(ev);
  }

  if (pool.length === 0) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick || null;
}
