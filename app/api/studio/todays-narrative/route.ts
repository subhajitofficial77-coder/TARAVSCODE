import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getContextCache } from '@/lib/studio/contextCache';

export async function GET(request: Request) {
  try {
    // Verify internal token for access. Accept either header X-Internal-Token or ?token= query param
    const headerToken = request.headers.get('X-Internal-Token');
    const url = new URL(request.url);
    const queryToken = url.searchParams.get('token');
    const providedToken = headerToken || queryToken || null;
    const validToken = process.env.INTERNAL_API_TOKEN;
    if (!validToken) {
      console.error('INTERNAL_API_TOKEN not configured');
      return NextResponse.json({ success: false, error: 'INTERNAL_API_TOKEN not configured' }, { status: 500 });
    }
    if (!providedToken || providedToken !== validToken) {
      return NextResponse.json({ success: false, error: 'Invalid or missing internal token' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // 0. Prefer an in-memory cached narrative if available (helps when DB schema is missing during dev)
    try {
      const cached = getContextCache();
      if (cached?.todaysNarrative) {
        return NextResponse.json({ success: true, source: 'cache', narrative: cached.todaysNarrative.narrative, timestamp: cached.todaysNarrative.timestamp });
      }
    } catch (e) { /* ignore cache errors */ }

    // 1. Try emotional_state last_event
    try {
      const { data: es, error: esErr } = await supabase.from('emotional_state').select('last_event, last_event_timestamp').order('created_at', { ascending: false }).limit(1).single() as any;
      if (!esErr && es && (es.last_event || es.last_event_timestamp)) {
        return NextResponse.json({ success: true, source: 'emotional_state', narrative: es.last_event || null, timestamp: es.last_event_timestamp || null });
      }
    } catch (e) {
      // ignore and continue
    }

    // 2. Try today's master_plan narrative
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: mp, error: mpErr } = await supabase.from('master_plans').select('narrative, date, created_at').eq('date', today).limit(1).single() as any;
      if (!mpErr && mp && (mp.narrative || mp.date)) {
        const ts = mp.created_at || (mp.date ? `${mp.date}T00:00:00.000Z` : null);
        return NextResponse.json({ success: true, source: 'master_plan', narrative: mp.narrative || null, timestamp: ts });
      }
    } catch (e) {
      // ignore and continue
    }

    // 3. Try latest simulation proposal event
    try {
      const { data: prop, error: propErr } = await supabase.from('simulation_proposals').select('event, created_at').order('created_at', { ascending: false }).limit(1).single() as any;
      if (!propErr && prop && (prop.event || prop.created_at)) {
        const narrative = typeof prop.event === 'string' ? prop.event : (prop.event?.description || null);
        return NextResponse.json({ success: true, source: 'simulation_proposal', narrative, timestamp: prop.created_at || null });
      }
    } catch (e) {
      // ignore
    }

    // Return a 200 with a fallback so callers (like n8n) don't error on 404
    const now = new Date();
    const formattedNow = now.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fallback = 'No narrative available yet.';
    return NextResponse.json({ success: true, source: 'fallback', narrative: null, timestamp: null, formatted: `${formattedNow}\n\n${fallback}` });
  } catch (err: any) {
    console.error('todays-narrative error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
