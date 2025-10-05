import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('simulation_proposals').select('*').order('created_at', { ascending: false }).limit(10);
    if (error) throw error;
    return NextResponse.json({ success: true, proposals: data });
  } catch (err: any) {
    console.error('debug proposals error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
