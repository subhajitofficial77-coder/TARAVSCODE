import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import generatePlanCandidatesFromContext from '@/lib/simulation/planGenerator';
import { fetchCurrentWeather } from '@/lib/api/weather';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    // load latest emotional state and relationships
    const [{ data: state }, { data: rels }] = await Promise.all([
      supabase.from('emotional_state').select('*').order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('relationships').select('*').order('entity_name')
    ] as any);

    const weather = await fetchCurrentWeather().catch(() => null);
    const candidates = generatePlanCandidatesFromContext({ emotionalState: state, relationships: rels || [], weather, narrative: state?.last_event });
    return NextResponse.json({ success: true, candidates });
  } catch (err: any) {
    console.error('plan-candidates GET error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = body?.action;
    const supabase = createServiceRoleClient();

    if (action === 'accept') {
      const items = body.items || [];
      if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ success: false, error: 'no items' }, { status: 400 });
      const { data, error } = await supabase.from('daily_plans').insert(items as any).select();
      if (error) throw error;
      return NextResponse.json({ success: true, inserted: data });
    }

    if (action === 'reject') {
      // No-op: rejection simply returns success; front-end should clear candidate preview
      return NextResponse.json({ success: true, rejected: true });
    }

    return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('plan-candidates POST error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
