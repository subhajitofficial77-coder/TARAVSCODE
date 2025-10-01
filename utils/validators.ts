import type { PrimaryEmotions, EmotionalState, ContentData, ContentType, RelationshipStatus, RelationshipType } from '@/types/database';

export function isValidEmotionValue(value: number): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

export function normalizeEmotionValue(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function validateEmotionalState(state: any): state is EmotionalState {
  try {
    if (!state) return false;
    if (typeof state.id !== 'string') return false;
    // basic primary_emotions shape check
    const pe: PrimaryEmotions = state.primary_emotions;
    if (!pe) return false;
    return true;
  } catch (err) {
    return false;
  }
}

export function isValidContentType(type: any): type is ContentType {
  return ['carousel', 'story', 'caption', 'post'].includes(type);
}

export function validateContentData(data: any): data is ContentData {
  if (!data) return false;
  return typeof data === 'object';
}

export function isValidRelationshipStatus(status: any): status is RelationshipStatus {
  return ['warm', 'neutral', 'strained', 'excellent'].includes(status);
}

export function isValidRelationshipType(type: any): type is RelationshipType {
  return ['family', 'friend', 'colleague', 'other'].includes(type);
}

export function isValidUUID(id: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(id);
}

export function isValidTimestamp(ts: string): boolean {
  return !Number.isNaN(Date.parse(ts));
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}
