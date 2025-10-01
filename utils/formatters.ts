export function formatScore(score: number) {
  if (!isFinite(score)) return 'N/A';
  return score.toFixed(2);
}

export function formatCategory(cat: string) {
  return cat.replace('_', ' ');
}
import { format, formatDistanceToNow } from 'date-fns';
import type { ContentType } from '@/types/database';

export function formatTimestamp(date?: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function formatRelativeTime(date?: string | Date | null): string {
  if (!date) return 'just now';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateIST(date?: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

export function formatEmotionValue(value: number): string {
  return `${Math.round((value ?? 0) * 100)}%`;
}

export function getDominantEmotion(emotions: PrimaryEmotions): keyof PrimaryEmotions {
  const entries = Object.entries(emotions) as [keyof PrimaryEmotions, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function truncateText(text: string, maxLength = 140): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

export function truncateContentPreview(text: string, maxLength = 200): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  // preserve word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) return truncated.slice(0, lastSpace) + '…';
  return truncated + '…';
}

export function formatHashtags(tags?: string[] | null): string[] {
  if (!tags) return [];
  return tags.map((t) => (t.startsWith('#') ? t : `#${t}`));
}

export function formatContentType(type: ContentType): string {
  return type.replace(/^[a-z]/, (s) => s.toUpperCase());
}

export function clampValue(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function getContentPlatformIcon(platform?: string | null): string {
  if (!platform) return 'FileText';
  const p = platform.toLowerCase();
  if (p.includes('insta') || p.includes('instagram')) return 'Instagram';
  if (p.includes('twitter') || p.includes('x')) return 'Twitter';
  if (p.includes('linkedin')) return 'Linkedin';
  return 'FileText';
}

import type { PrimaryEmotions, Mood } from '@/types/database';
export function formatEmotionalImpact(impact: { emotions?: Partial<PrimaryEmotions>, mood?: Partial<Mood> } | undefined): string {
  if (!impact) return '';
  const parts: string[] = [];
  if (impact.emotions) {
    for (const [k, v] of Object.entries(impact.emotions)) {
      if (!v || v === 0) continue;
      const sign = v > 0 ? '+' : '-';
      parts.push(`${capitalize(k)} ${sign}${Math.round(Math.abs(v) * 100)}%`);
    }
  }
  if (impact.mood) {
    for (const [k, v] of Object.entries(impact.mood)) {
      if (!v || v === 0) continue;
      const sign = v > 0 ? '+' : '-';
      parts.push(`${capitalize(k.replace('_', ' '))} ${sign}${Math.round(Math.abs(v) * 100)}%`);
    }
  }
  return parts.join(', ');
}

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
