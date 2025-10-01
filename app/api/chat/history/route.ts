import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveChatMessage } from '@/lib/supabase/queries';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, created_at } = body;
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'message required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    try {
      await saveChatMessage(supabase, { role: 'tara', message, created_at });
    } catch (e) {
      console.warn('Failed to save final streamed message', e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('chat/history error', err);
    return NextResponse.json({ success: false, error: 'internal' }, { status: 500 });
  }
}
