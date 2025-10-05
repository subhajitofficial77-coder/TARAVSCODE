import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    let res = await supabase.from('simulation_proposals').select('*').order('created_at', { ascending: false }).limit(1).single();
    let { data, error } = res as any;
    // If table missing, attempt to create and retry once
    if (error && error.code === 'PGRST205') {
      console.warn('simulation_proposals table missing; attempting to create via exec_sql');
      await supabase.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS simulation_proposals (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          title text,
          narrative text,
          payload jsonb DEFAULT '{}',
          rejected boolean DEFAULT false,
          created_at timestamptz DEFAULT now()
        );
      ` } as any).catch(() => null);
      res = await supabase.from('simulation_proposals').select('*').order('created_at', { ascending: false }).limit(1).single();
      data = (res as any).data;
      error = (res as any).error;
    }
    if (error) throw error;
    return NextResponse.json({ success: true, proposal: data });
  } catch (err: any) {
    console.error('proposal GET error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServiceRoleClient();
    const body = await req.json();
    const action = body?.action;

    if (action === 'accept_mood') {
      const mood = body.mood;
      const primary_emotions = body.primary_emotions;
      if (!mood || !primary_emotions) return NextResponse.json({ success: false, error: 'missing data' }, { status: 400 });
      const { data, error } = await supabase.from('emotional_state').update({ mood, primary_emotions, updated_at: new Date().toISOString() } as any).select().limit(1).single();
      if (error) throw error;
      return NextResponse.json({ success: true, emotional_state: data });
    }

    if (action === 'accept_content') {
      const items = body.items || [];
      if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ success: false, error: 'no items' }, { status: 400 });
      const { data, error } = await supabase.from('daily_plans').insert(items as any).select();
      if (error) throw error;
      return NextResponse.json({ success: true, inserted: data });
    }

    if (action === 'reject') {
      // mark latest proposal as rejected (optional)
      let latestRes = await supabase.from('simulation_proposals').select('*').order('created_at', { ascending: false }).limit(1).single() as any;
      let latest = latestRes.data;
      // If table missing, attempt to create and retry once
      if (latestRes.error && latestRes.error.code === 'PGRST205') {
        await supabase.rpc('exec_sql', { sql: `
          CREATE TABLE IF NOT EXISTS simulation_proposals (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            title text,
            narrative text,
            payload jsonb DEFAULT '{}',
            rejected boolean DEFAULT false,
            created_at timestamptz DEFAULT now()
          );
        ` } as any).catch(() => null);
        latestRes = await supabase.from('simulation_proposals').select('*').order('created_at', { ascending: false }).limit(1).single() as any;
        latest = latestRes.data;
      }
      if (latest?.id) {
        await supabase.from('simulation_proposals').update({ rejected: true } as any).eq('id', latest.id).catch(() => null);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('proposal POST error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
