import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { clearContextCache } from '@/lib/studio/contextCache';
import { setContextCache } from '@/lib/studio/contextCache';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('X-Internal-Token');
    const validToken = process.env.INTERNAL_API_TOKEN;
    if (!validToken) return NextResponse.json({ success: false, error: 'INTERNAL_API_TOKEN not configured' }, { status: 500 });
    if (!token || token !== validToken) return NextResponse.json({ success: false, error: 'Invalid or missing X-Internal-Token' }, { status: 401 });

    const body = await req.json();
    const narrative = body?.narrative ?? body?.event ?? null;
    const timestamp = body?.timestamp ?? new Date().toISOString();
    if (!narrative) return NextResponse.json({ success: false, error: 'missing narrative' }, { status: 400 });

  const supabase = createServiceRoleClient();

  // Cache the narrative immediately (best-effort) so internal endpoints and n8n can read it even if DB writes fail
  try { setContextCache({ todaysNarrative: { narrative, timestamp } }); } catch {}

  // Try to insert into simulation_proposals (store event as text or json)
    try {
      const payload: any = { created_at: timestamp, event: typeof narrative === 'string' ? narrative : JSON.stringify(narrative) };
      const insertResp: any = await (supabase as any).from('simulation_proposals').insert([payload]).select().limit(1);
      if (insertResp.error) {
        console.warn('persist-narrative insert error, attempting to create table and retry', insertResp.error?.message || insertResp.error);
        // Attempt to create the table and retry
        try {
          await (supabase as any).rpc('exec_sql', { sql: `
            CREATE TABLE IF NOT EXISTS simulation_proposals (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              created_at timestamptz DEFAULT now(),
              candidates jsonb,
              event text
            );
          ` } as any);
        } catch (createErr) {
          console.error('persist-narrative create table via exec_sql failed', createErr);
        }
        // Retry insert once
        try {
          const retry: any = await (supabase as any).from('simulation_proposals').insert([payload]).select().limit(1);
          if (retry.error) {
            console.error('persist-narrative retry insert failed', retry.error);
            return NextResponse.json({ success: false, error: 'Failed to persist narrative after retry' }, { status: 500 });
          }
        } catch (retryErr) {
          console.error('persist-narrative retry exception', retryErr);
          return NextResponse.json({ success: false, error: 'Failed to persist narrative' }, { status: 500 });
        }
      }
    } catch (err) {
      console.error('persist-narrative error', err);
      const e: any = err;
      return NextResponse.json({ success: false, error: e?.message || String(err) }, { status: 500 });
    }

  // Also store the narrative in the in-memory cache so internal endpoints (and n8n) see it even if DB writes fail
  try { setContextCache({ todaysNarrative: { narrative, timestamp } }); } catch {}

    return NextResponse.json({ success: true, narrative, timestamp });
  } catch (err: any) {
    console.error('persist-narrative route error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
