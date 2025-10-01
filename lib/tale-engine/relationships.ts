import type { Relationship, RelationshipStatus } from '@/types/database';
import type { LifeEvent, RelationshipImpact } from '@/types/tale';

export const DECAY_HOURS_DEFAULT = 36;
export const DECAY_HOURS_SEVERE = 72;

const STATUS_HIERARCHY: Record<RelationshipStatus, number> = {
  excellent: 3,
  warm: 2,
  neutral: 1,
  strained: 0
};

export function calculateDecayTimer(status: RelationshipStatus, customHours?: number): string | null {
  if (status === 'strained') {
    const hours = customHours ?? DECAY_HOURS_DEFAULT;
    const dt = new Date(Date.now() + hours * 3600 * 1000);
    return dt.toISOString();
  }
  return null;
}

export function processRelationshipImpacts(relationships: Relationship[], event: LifeEvent): Relationship[] {
  const updates: Relationship[] = [];
  if (!event.relationship_impact || event.relationship_impact.length === 0) return updates;

  for (const impact of event.relationship_impact) {
    const match = relationships.find((r) => r.entity_name === impact.entity_name);
    if (!match) continue;

    const updated: Relationship = { ...match };
    updated.status = impact.status_change;
    updated.last_interaction = new Date().toISOString();
    updated.updated_at = new Date().toISOString();
    if (impact.status_change === 'strained') {
      updated.decay_timer = calculateDecayTimer(impact.status_change, impact.decay_hours);
    } else {
      updated.decay_timer = null;
    }
    updates.push(updated);
  }

  return updates;
}

export function checkAndApplyDecay(relationship: Relationship): Relationship | null {
  if (!relationship.decay_timer) return null;
  const now = new Date();
  const decay = new Date(relationship.decay_timer);
  if (now >= decay) {
    const updated = { ...relationship };
    if (updated.status === 'strained') updated.status = 'neutral';
    updated.decay_timer = null;
    updated.updated_at = new Date().toISOString();
    return updated;
  }
  return null;
}

export function processAllDecays(relationships: Relationship[]): Relationship[] {
  const changed: Relationship[] = [];
  for (const r of relationships) {
    const res = checkAndApplyDecay(r);
    if (res) changed.push(res);
  }
  return changed;
}

export function getRelationshipScore(status: RelationshipStatus): number {
  return STATUS_HIERARCHY[status] ?? 0;
}

export function getRelationshipSummary(relationships: Relationship[]) {
  const total = relationships.length;
  const warm = relationships.filter((r) => r.status === 'warm' || r.status === 'excellent').length;
  const strained = relationships.filter((r) => r.status === 'strained').length;
  const average_score = relationships.reduce((acc, r) => acc + getRelationshipScore(r.status), 0) / Math.max(1, total);
  return { total, warm, strained, average_score };
}
