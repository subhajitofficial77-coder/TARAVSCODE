import type { EmotionalState, PrimaryEmotions, Mood, CoreTraits, Relationship } from '@/types/database';
import type { LifeEvent, SimulationResult } from '@/types/tale';
import { LIFE_EVENTS, getWeightedRandomEvent } from './tale-engine/events';
import { processRelationshipImpacts } from './tale-engine/relationships';

const EMOTION_DECAY_RATE = 0.1;
const MOOD_INERTIA_WEIGHT = 0.7;
const EMOTION_CLAMP_MIN = 0.0;
const EMOTION_CLAMP_MAX = 1.0;

const BASELINE_EMOTIONS: PrimaryEmotions = {
  joy: 0.5,
  trust: 0.5,
  fear: 0.3,
  surprise: 0.4,
  sadness: 0.3,
  disgust: 0.2,
  anger: 0.2,
  anticipation: 0.6
};

function clampEmotion(value: number) {
  return Math.max(EMOTION_CLAMP_MIN, Math.min(EMOTION_CLAMP_MAX, value));
}

function getTraitMultiplier(emotion: keyof PrimaryEmotions, traits: CoreTraits) {
  // Multipliers between 0.8 and 1.2
  let multiplier = 1.0;
  switch (emotion) {
    case 'joy':
    case 'trust':
      multiplier += (traits.warmth - 0.5) * 0.4; // warmth amplifies social emotions
      break;
    case 'anger':
    case 'disgust':
      multiplier -= (traits.warmth - 0.5) * 0.3; // warmth dampens negative social emotions
      break;
    case 'surprise':
    case 'anticipation':
      multiplier += (traits.wit - 0.5) * 0.4;
      break;
    case 'fear':
      multiplier -= (traits.wit - 0.5) * 0.25;
      break;
    case 'sadness':
      multiplier -= (traits.ambition - 0.5) * 0.2; // ambition can buffer sadness
      break;
    default:
      break;
  }
  return Math.max(0.6, Math.min(1.4, multiplier));
}

export function selectDailyEvent(): LifeEvent | null {
  return getWeightedRandomEvent();
}

export function applyEmotionalImpact(current: PrimaryEmotions, impact: Partial<PrimaryEmotions>, traits: CoreTraits): PrimaryEmotions {
  const result: PrimaryEmotions = { ...current };
  for (const k of Object.keys(impact) as (keyof PrimaryEmotions)[]) {
    const delta = impact[k] ?? 0;
    const mult = getTraitMultiplier(k, traits);
    result[k] = clampEmotion(result[k] + delta * mult);
  }
  return result;
}

export function calculateMoodFromEmotions(emotions: PrimaryEmotions): Partial<Mood> {
  const optimism = clampEmotion((emotions.joy + emotions.trust + emotions.anticipation - emotions.sadness - emotions.fear) / 5 + 0.5);
  const energy_level = clampEmotion((emotions.joy + emotions.anticipation + emotions.surprise - emotions.sadness - emotions.fear) / 5 + 0.5);
  const stress_level = clampEmotion((emotions.fear + emotions.anger + emotions.disgust) / 3);
  return { optimism, energy_level, stress_level };
}

export function applyMoodPersistence(current: Mood, newSignals: Partial<Mood>): Mood {
  return {
    optimism: clampEmotion((current.optimism * MOOD_INERTIA_WEIGHT) + ((newSignals.optimism ?? current.optimism) * (1 - MOOD_INERTIA_WEIGHT))),
    energy_level: clampEmotion((current.energy_level * MOOD_INERTIA_WEIGHT) + ((newSignals.energy_level ?? current.energy_level) * (1 - MOOD_INERTIA_WEIGHT))),
    stress_level: clampEmotion((current.stress_level * MOOD_INERTIA_WEIGHT) + ((newSignals.stress_level ?? current.stress_level) * (1 - MOOD_INERTIA_WEIGHT)))
  };
}

export function applyEmotionalDecay(emotions: PrimaryEmotions): PrimaryEmotions {
  const result: PrimaryEmotions = { ...emotions };
  for (const k of Object.keys(result) as (keyof PrimaryEmotions)[]) {
    result[k] = result[k] + (BASELINE_EMOTIONS[k] - result[k]) * EMOTION_DECAY_RATE;
    result[k] = clampEmotion(result[k]);
  }
  return result;
}

export function processLifeEvent(state: EmotionalState, event: LifeEvent): EmotionalState {
  const traits: CoreTraits = state.core_traits;
  // 1. Decay
  let emotions = applyEmotionalDecay(state.primary_emotions);

  // 2. Apply event impact
  emotions = applyEmotionalImpact(emotions, event.emotional_impact || {}, traits);

  // 3. Calculate mood signals
  const moodSignals = calculateMoodFromEmotions(emotions);

  // 4. Apply mood persistence
  const newMood = applyMoodPersistence(state.mood as Mood, moodSignals as Mood);

  // 5. Blend direct mood_impact if present
  if (event.mood_impact) {
    newMood.optimism = clampEmotion(newMood.optimism + (event.mood_impact.optimism ?? 0));
    newMood.energy_level = clampEmotion(newMood.energy_level + (event.mood_impact.energy_level ?? 0));
    newMood.stress_level = clampEmotion(newMood.stress_level + (event.mood_impact.stress_level ?? 0));
  }

  const newState: EmotionalState = {
    ...state,
    primary_emotions: emotions,
    mood: newMood,
    last_event: event.description,
    last_event_timestamp: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return newState;
}

export async function runDailySimulation(currentState: EmotionalState, relationships: Relationship[]): Promise<SimulationResult> {
  const event = selectDailyEvent() || LIFE_EVENTS[Math.floor(Math.random() * LIFE_EVENTS.length)];

  // Process relationships impacts
  const relationshipUpdates = processRelationshipImpacts(relationships, event as any);

  const newState = processLifeEvent(currentState, event as any);
  const timestamp = new Date().toISOString();

  return {
    newState,
    event: event as LifeEvent,
    relationshipUpdates,
    timestamp,
    summary: `Event ${event.name} applied.`
  } as SimulationResult;
}

// Debug utilities
export function getEmotionalSummary(state: EmotionalState) {
  const dominant = Object.entries(state.primary_emotions).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];
  return {
    dominant_emotion: dominant,
    mood: state.mood
  };
}
