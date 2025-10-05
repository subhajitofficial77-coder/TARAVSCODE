import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { fetchCurrentWeather } from '@/lib/api/weather';

// This endpoint is intentionally dev-only. It returns the server-assembled
// studio context using the service role client so the browser can inspect it
// while debugging without needing the INTERNAL_API_TOKEN.
export async function GET() {
  try {
    const allowDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === 'true';
    if (!allowDev) {
      return NextResponse.json({ error: 'Dev-only endpoint' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const result: any = { warnings: [] };

    // emotional state
    try {
      const { data: es, error: esErr } = await supabase.from('emotional_state').select('*').order('created_at', { ascending: false }).limit(1).single();
      if (esErr) throw esErr;
      result.emotional_state = es || null;
    } catch (err: any) {
      console.error('debug: emotional_state error', err);
      result.emotional_state = null;
      result.warnings.push('Could not fetch emotional_state');
    }

    // relationships
    try {
      const { data: rels, error: relErr } = await supabase.from('relationships').select('*').order('entity_name');
      if (relErr) throw relErr;
      result.relationships = rels || [];
    } catch (err: any) {
      console.error('debug: relationships error', err);
      result.relationships = [];
      result.warnings.push('Could not fetch relationships');
    }

    // daily plans
    try {
      const { data: plans, error: plansErr } = await supabase.from('daily_plans').select('*').eq('completed', false).order('priority', { ascending: true });
      if (plansErr) throw plansErr;
      result.daily_plans = plans || [];
    } catch (err: any) {
      console.error('debug: daily_plans error', err);
      result.daily_plans = [];
      result.warnings.push('Could not fetch daily_plans');
    }

    // weather
    try {
      const weather = await fetchCurrentWeather();
      result.weather = weather || null;
    } catch (err: any) {
      console.error('debug: weather error', err);
      result.weather = null;
      result.warnings.push('Could not fetch weather');
    }

    return NextResponse.json({ context: result, warnings: result.warnings.length ? result.warnings : undefined });
  } catch (err: any) {
    console.error('debug studio-context error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const allowDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_DEV_CONTROLS === 'true';
    if (!allowDev) {
      return NextResponse.json({ error: 'Dev-only endpoint' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();

    // Ensure emotional_state exists
    try {
      const { data: esData, error: esErr } = await supabase.from('emotional_state').select('*').limit(1).single();
      if (!esData) {
        await supabase.from('emotional_state').insert({ primary_emotions: {}, mood: {}, created_at: new Date().toISOString() } as any);
      }
    } catch (err) {
      console.warn('Could not ensure emotional_state', err);
    }

    // Ensure some daily_plans exist
    try {
      const { data: plans } = await supabase.from('daily_plans').select('*').limit(1);
      if (!plans || plans.length === 0) {
        const sample = [
          { item_type: 'carousel', topic: 'Mother-daughter relationships', status: 'scheduled', priority: 1, short_description: 'Mother-daughter relationships — 5-7 slides.' },
          { item_type: 'story', topic: 'Family traditions poll', status: 'in-review', priority: 2, short_description: 'Family traditions poll — 1-3 story frames.' }
        ];
        await supabase.from('daily_plans').insert(sample as any);
      }
    } catch (err) {
      console.warn('Could not ensure daily_plans', err);
    }

    // Return refreshed context
    const resp = await fetch('/api/debug/studio-context');
    const json = await resp.json();
    return NextResponse.json(json);
  } catch (err: any) {
    console.error('seed debug error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
