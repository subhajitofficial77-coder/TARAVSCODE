import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateGeneratedContent } from '@/lib/supabase/queries';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const updates = {} as any;
    if (body.data) updates.data = body.data;
    if (body.metadata) updates.metadata = body.metadata;

    const supabase = createServerSupabaseClient();
    const updated = await updateGeneratedContent(supabase, id, updates);
    if (!updated) return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
    return NextResponse.json({ success: true, content: updated });
  } catch (err) {
    console.error('generated-content PATCH error', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
