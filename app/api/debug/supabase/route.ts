import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return NextResponse.json({ ok: false, reason: 'missing-env', supabase_url: SUPABASE_URL, keyLength: SERVICE_ROLE ? SERVICE_ROLE.length : null }, { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data, error } = await supabase.from('daily_plans').select('id, item_type, topic, status, scheduled_for, created_at').order('id', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, reason: 'query-error', message: error.message || error, supabase_url: SUPABASE_URL, keyLength: SERVICE_ROLE.length }, { status: 200 });
    }

    const row_statuses = Array.from(new Set((data || []).map((r: any) => r.status || 'pending')));
    return NextResponse.json({ ok: true, supabase_url: SUPABASE_URL, keyLength: SERVICE_ROLE.length, row_count: Array.isArray(data) ? data.length : 0, row_statuses, raw_rows: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: 'exception', message: (err as any).message || String(err) }, { status: 500 });
  }
}
