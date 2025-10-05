import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) return NextResponse.json({ error: 'missing env' }, { status: 500 });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const id = Number(params.id);
  const { data, error } = await supabase.from('daily_plans').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });
  return NextResponse.json({ data }, { status: 200 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) return NextResponse.json({ error: 'missing env' }, { status: 500 });
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const id = Number(params.id);
  try {
    const body = await req.json();
    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    const { data, error } = await supabase.from('daily_plans').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message || error }, { status: 500 });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as any).message || String(err) }, { status: 500 });
  }
}
