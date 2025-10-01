import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { validateFeedbackAction, calculateFeedbackImpact, getFeedbackImpactSummary, logFeedbackEvent } from '@/lib/feedback-loop';
import type { FeedbackRequest } from '@/types/feedback';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload: FeedbackRequest = body;
    if (!payload || !payload.contentId || !payload.action || !validateFeedbackAction(payload.action)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

  const supabase = createServiceRoleClient();

  // Instead of writing directly, forward the request to the Supabase Edge Function 'feedback-handler'
  try {
    const svc = createServiceRoleClient();
    // Invoke the Supabase Edge Function and destructure its response
    const invokeRes: any = await (svc as any).functions.invoke('feedback-handler', { body: { contentId: payload.contentId, action: payload.action } });
    // Supabase functions.invoke typically returns an object with `data` and `error` at top-level
    const { data, error } = invokeRes || {};
    if (error) {
      return NextResponse.json({ success: false, error: error }, { status: 500 });
    }

    // Ensure the client receives a normalized payload. If the edge function returned an object
    // like { success, message, emotionalImpact } in `data`, forward it.
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
