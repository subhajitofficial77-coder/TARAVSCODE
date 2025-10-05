import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const sample = [
      { type: 'carousel', topic: 'Mother-daughter relationships', status: 'pending' },
      { type: 'story', topic: 'Family traditions poll', status: 'pending' },
      { type: 'caption', topic: 'Childhood memories', status: 'pending' }
    ];

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      // Return a harmless sample so the UI can render
      return NextResponse.json({ data: sample, meta: { source: 'fallback-missing-env' } }, { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await supabase.from('daily_plans').select('id, item_type, topic, status, scheduled_for').order('id', { ascending: true });
    // Debug: log non-sensitive info to help verify which Supabase project we're querying
    // Minimal non-sensitive logging for development
    try {
      console.log('[daily-plan] Rows fetched count:', Array.isArray(data) ? data.length : 0);
    } catch (e) {
      // ignore logging errors
    }
    if (error) {
      console.error('daily-plan API error:', error.message || error);
      return NextResponse.json({ data: sample, meta: { source: 'fallback-query-error' } }, { status: 200 });
    }

  // Map DB rows to the shape expected by the UI and enrich them with helpful suggestions
  const items = (data || []).map((r: any) => {
    const base = { id: r.id, type: r.item_type, topic: r.topic, status: r.status, scheduled_for: r.scheduled_for, created_at: r.created_at } as any;

    // deterministic enrichment rules (no external AI call) — can be replaced with AI later
    const topicLower = (r.topic || '').toLowerCase();
    const enrichment: any = {};
    // suggest platform based on type
    if (r.item_type === 'carousel') enrichment.suggested_platform = 'instagram';
    else if (r.item_type === 'story') enrichment.suggested_platform = 'instagram';
    else if (r.item_type === 'caption') enrichment.suggested_platform = 'twitter';
    else enrichment.suggested_platform = 'instagram';

    // length and CTA heuristics
    if (r.item_type === 'carousel') {
      enrichment.length = '5-7 slides';
      enrichment.suggested_cta = 'Save for later • Share your story';
    } else if (r.item_type === 'story') {
      enrichment.length = '1-3 story frames';
      enrichment.suggested_cta = 'Vote now';
    } else if (r.item_type === 'caption') {
      enrichment.length = '1 short paragraph';
      enrichment.suggested_cta = 'Share a memory in comments';
    } else {
      enrichment.length = 'Short';
      enrichment.suggested_cta = 'Read more';
    }

    // basic tags heuristics from topic
    const tags = new Set<string>();
    if (topicLower.includes('mother') || topicLower.includes('family')) tags.add('family');
    if (topicLower.includes('child') || topicLower.includes('childhood')) tags.add('nostalgia');
    if (topicLower.includes('tradition')) tags.add('tradition');
    if (topicLower.includes('poll') || topicLower.includes('vote')) tags.add('engagement');

    enrichment.tags = Array.from(tags);
    enrichment.short_description = `${r.topic} — ${enrichment.length}. Suggested CTA: ${enrichment.suggested_cta}.`;

    return { ...base, ...enrichment };
  });
  const row_count = Array.isArray(items) ? items.length : 0;
  const row_statuses = Array.from(new Set(items.map((it: any) => (it.status || 'pending'))));

  if (!items || items.length === 0) {
    return NextResponse.json({ data: sample, meta: { source: 'fallback-empty-db', supabase_url: SUPABASE_URL, row_count: 0, row_statuses: [] } }, { status: 200 });
  }

  // Return items with helpful debug metadata (non-sensitive)
  return NextResponse.json({ data: items, meta: { source: 'db', supabase_url: SUPABASE_URL, row_count, row_statuses, raw_rows: data } }, { status: 200 });
  } catch (err) {
    console.error('daily-plan API unexpected error:', err);
    const fallback = [
      { type: 'carousel', topic: 'Mother-daughter relationships', status: 'pending' },
      { type: 'story', topic: 'Family traditions poll', status: 'pending' },
      { type: 'caption', topic: 'Childhood memories', status: 'pending' }
    ];
    return NextResponse.json({ data: fallback, meta: { source: 'fallback-exception' } }, { status: 200 });
  }
}
