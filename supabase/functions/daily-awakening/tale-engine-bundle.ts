// TALE engine bundle for Supabase Edge Function
// Reuse the canonical TALE event set and engine mechanics from the main lib so edge simulations match app behavior.
import { LIFE_EVENTS } from '../../../lib/tale-engine/events';
import {
  applyEmotionalDecay,
  applyEmotionalImpact,
  calculateMoodFromEmotions,
  applyMoodPersistence,
  runDailySimulation as runDailySimulationLib,
  selectDailyEvent as selectDailyEventLib
} from '../../../lib/tale-engine';
import { processRelationshipImpacts } from '../../../lib/tale-engine/relationships';

export { LIFE_EVENTS };

export function getDominantEmotion(emotions: Record<string, number>): string {
  const entries = Object.entries(emotions) as [string, number][];
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export function selectDailyEvent() {
  return selectDailyEventLib();
}

export { applyEmotionalDecay, applyEmotionalImpact, calculateMoodFromEmotions, applyMoodPersistence, processRelationshipImpacts };

export async function runDailySimulation(currentState: any, relationships: any[]) {
  // delegate to the canonical lib implementation for consistent behavior
  return runDailySimulationLib(currentState, relationships as any);
}
