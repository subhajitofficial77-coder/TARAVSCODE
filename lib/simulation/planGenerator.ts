import type { EmotionalState, Relationship } from '@/types/database';

function extractKeywords(text: string, max = 3) {
  if (!text) return [];
  // very simple keyword extractor: split by non-word and take longest words
  const words = text
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words) {
    const low = w.toLowerCase();
    if (low.length < 3) continue;
    if (seen.has(low)) continue;
    seen.add(low);
    out.push(low);
    if (out.length >= max) break;
  }
  return out;
}

export function generatePlanCandidatesFromContext(params: {
  emotionalState: EmotionalState | null;
  relationships: Relationship[];
  weather?: any;
  narrative?: string;
  masterPlanId?: string | null;
}) {
  const { emotionalState, relationships, weather, narrative } = params;
  const mood = emotionalState?.mood || { energy_level: 0.5, optimism: 0.5, stress_level: 0.3 };

  const topics = extractKeywords(narrative || emotionalState?.last_event || '', 3);
  if (topics.length === 0) topics.push('story');

  const candidates: any[] = [];
  for (const t of topics) {
    let item_type = 'caption';
    if ((mood.energy_level ?? 0) > 0.7) item_type = 'carousel';
    else if ((mood.energy_level ?? 0) > 0.5) item_type = 'story';

    const suggested_platform = item_type === 'caption' ? 'twitter' : 'instagram';

    let priority = 2;
    if (relationships && relationships.some((r: any) => (t.includes((r.entity_name || '').toLowerCase())))) priority += 1;
    if ((mood.optimism ?? 0) < 0.4) priority += 1;

    let topicLabel = t;
    if (weather && weather.condition) {
      const cond = (weather.condition || '').toLowerCase();
      if (cond.includes('rain') || cond.includes('mist')) topicLabel = `${topicLabel} (cozy/reflection)`;
    }

    candidates.push({
      item_type,
      topic: topicLabel,
      status: 'pending',
      priority,
      suggested_platform,
      created_at: new Date().toISOString()
    });
  }

  // Add a small reflective caption candidate
  candidates.push({
    item_type: 'caption',
    topic: `Reflection: ${((narrative || emotionalState?.last_event) || '').slice(0, 120)}`,
    status: 'pending',
    priority: 1,
    suggested_platform: 'twitter',
    created_at: new Date().toISOString()
  });

  return candidates.slice(0, 4);
}

export default generatePlanCandidatesFromContext;
