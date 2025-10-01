import type { EmotionalState, PrimaryEmotions, Mood } from '@/types/database';
import type { FeedbackAction, FeedbackImpact, FeedbackAnalysis } from '@/types/feedback';
import { applyEmotionalImpact, calculateMoodFromEmotions, applyMoodPersistence } from './tale-engine';

// Feedback impact templates apply only the explicitly requested deltas.
// Per verification: accepted -> joy += 0.2, confidence += 0.1
// rejected -> sadness += 0.3, stress += 0.2 (stress is a mood field)
const FEEDBACK_IMPACTS: Record<FeedbackAction, { emotions: Partial<PrimaryEmotions>; mood: Partial<Mood> }> = {
  accepted: {
    emotions: { joy: 0.2, confidence: 0.1 } as any,
    mood: {}
  },
  rejected: {
    emotions: { sadness: 0.3 } as any,
    mood: { stress_level: 0.2 }
  }
};

function clamp(v: number, min = 0, max = 1) { return Math.max(min, Math.min(max, v)); }

export function validateFeedbackAction(action: any): action is FeedbackAction {
  return action === 'accepted' || action === 'rejected';
}

export function getFeedbackImpactSummary(action: FeedbackAction): string {
  if (action === 'accepted') return "Your acceptance brings TARA joy and confidence";
  return 'Your feedback helps TARA learn and grow';
}

export function logFeedbackEvent(contentId: string, action: FeedbackAction, impact: FeedbackImpact) {
  const ts = new Date().toISOString();
  const parts: string[] = [];
  if (impact.emotions) for (const [k, v] of Object.entries(impact.emotions)) parts.push(`${k} ${v >= 0 ? '+' : '-'}${Math.round(Math.abs(v) * 100)}%`);
  if (impact.mood) for (const [k, v] of Object.entries(impact.mood)) parts.push(`${k} ${v >= 0 ? '+' : '-'}${Math.round(Math.abs(v) * 100)}%`);
  // eslint-disable-next-line no-console
  console.log(`[FEEDBACK] ${ts} - Content ${contentId} ${action} - Impact: ${parts.join(', ')}`);
}

export function calculateFeedbackImpact(action: FeedbackAction, currentState: EmotionalState): { newState: EmotionalState; impact: FeedbackImpact } {
  const template = FEEDBACK_IMPACTS[action];

  // Apply emotional impact using TALE engine (modulated by traits)
  const newEmotions = applyEmotionalImpact(currentState.primary_emotions, template.emotions as any, currentState.core_traits);

  // Derive mood signals from emotions
  const moodSignals = calculateMoodFromEmotions(newEmotions as any) as Mood;

  // Apply persistence
  const persistedMood = applyMoodPersistence(currentState.mood as any, moodSignals as any) as Mood;

  // Apply direct mood adjustments from template
  const finalMood: Mood = {
    optimism: clamp(persistedMood.optimism + (template.mood.optimism ?? 0)),
    energy_level: clamp(persistedMood.energy_level + (template.mood.energy_level ?? 0)),
    stress_level: clamp(persistedMood.stress_level + (template.mood.stress_level ?? 0))
  };

  const newState: EmotionalState = {
    ...currentState,
    primary_emotions: newEmotions,
    mood: finalMood,
    updated_at: new Date().toISOString()
  };

  const impact: FeedbackImpact = { emotions: template.emotions, mood: template.mood };
  return { newState, impact };
}

export default { validateFeedbackAction, calculateFeedbackImpact, getFeedbackImpactSummary, logFeedbackEvent };
