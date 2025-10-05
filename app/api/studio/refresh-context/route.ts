import { NextResponse } from 'next/server';
import { getStudioContext } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const ctx = await getStudioContext();
    if (!ctx) return NextResponse.json({ success: false, error: 'No context' }, { status: 500 });
    return NextResponse.json({ success: true, context: ctx });
  } catch (err: any) {
    console.error('refresh-context error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
