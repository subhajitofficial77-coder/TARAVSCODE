// Supabase Edge Function: feedback-handler
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function clamp(v: number, min = 0, max = 1) { return Math.max(min, Math.min(max, v)); }

// Minimal feedback impact calculator (self-contained for Deno function)
function calculateFeedbackImpact(action: string, currentState: any) {
  const now = new Date().toISOString();
  const baseEmotions = { ...(currentState.primary_emotions || {}) };
  const baseMood = { ...(currentState.mood || {}) };
  // Track deltas applied so the caller can know exactly what changed
  const deltas: any = { emotions: {}, mood: {} };

  if (action === 'accepted') {
    const joyDelta = 0.2;
    const confidenceDelta = 0.1;
    baseEmotions.joy = clamp((baseEmotions.joy || 0) + joyDelta);
    baseEmotions.confidence = clamp((baseEmotions.confidence || 0) + confidenceDelta);
    deltas.emotions.joy = joyDelta;
    deltas.emotions.confidence = confidenceDelta;
  } else if (action === 'rejected') {
    const sadnessDelta = 0.3;
    const stressDelta = 0.2;
    baseEmotions.sadness = clamp((baseEmotions.sadness || 0) + sadnessDelta);
    baseMood.stress_level = clamp((baseMood.stress_level || 0) + stressDelta);
    deltas.emotions.sadness = sadnessDelta;
    deltas.mood.stress_level = stressDelta;
  }

  // Simple mood derivation: optimism = joy - sadness, energy influenced by confidence
  const newMood = {
    optimism: clamp((baseEmotions.joy || 0) - (baseEmotions.sadness || 0)),
    energy_level: clamp((baseEmotions.confidence || 0) * 0.5 + (baseMood.energy_level || 0) * 0.5),
    stress_level: clamp(baseMood.stress_level || 0)
  };

  const newState = {
    ...currentState,
    primary_emotions: baseEmotions,
    mood: newMood,
    updated_at: now
  };

  const impact = deltas;
  return { newState, impact };
}

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Supabase env vars' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (req.method !== 'POST') return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { status: 405 });

    const body = await req.json();
    const { contentId, action } = body as { contentId?: string; action?: string };
    if (!contentId || !action) return new Response(JSON.stringify({ success: false, error: 'Invalid payload' }), { status: 400 });

    // load content
    const { data: content } = await supabase.from('generated_content').select('id, user_feedback').eq('id', contentId).single();
    if (!content) return new Response(JSON.stringify({ success: false, error: 'Content not found' }), { status: 404 });
    if (content.user_feedback) return new Response(JSON.stringify({ success: false, error: 'Feedback already submitted' }), { status: 409 });

    // load emotional_state (single row)
    const { data: stateRow } = await supabase.from('emotional_state').select('*').limit(1).single();
    if (!stateRow) return new Response(JSON.stringify({ success: false, error: 'Emotional state not found' }), { status: 500 });

    // calculate impact
    const { newState, impact } = calculateFeedbackImpact(action as any, stateRow as any);

    // persist updates transactionally (best-effort)
    const { error: contentErr } = await supabase.from('generated_content').update({ user_feedback: action, feedback_received_at: new Date().toISOString() }).eq('id', contentId);
    if (contentErr) return new Response(JSON.stringify({ success: false, error: String(contentErr) }), { status: 500 });

    const { error: stateErr } = await supabase.from('emotional_state').update({ primary_emotions: newState.primary_emotions, mood: newState.mood, updated_at: newState.updated_at }).eq('id', stateRow.id);
    if (stateErr) {
      // rollback content update
      await supabase.from('generated_content').update({ user_feedback: null }).eq('id', contentId);
      return new Response(JSON.stringify({ success: false, error: String(stateErr) }), { status: 500 });
    }

  // Return the applied deltas so callers can surface exact emotionalImpact
  return new Response(JSON.stringify({ success: true, message: 'Feedback persisted', emotionalImpact: impact }), { status: 200 });
  } catch (err) {
    console.error('Feedback handler error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
});
