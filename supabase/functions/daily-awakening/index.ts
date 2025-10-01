// Deno-based Supabase Edge Function: daily-awakening
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { runDailySimulation, getDominantEmotion } from './tale-engine-bundle.ts';

// Run the compact TALE simulation bundle, persist results, and return a summary
serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Supabase env vars' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: currentState, error: stateError } = await supabase.from('emotional_state').select('*').limit(1).single();
    if (stateError || !currentState) {
      return new Response(JSON.stringify({ success: false, error: 'Could not load emotional_state' }), { status: 500 });
    }

    const { data: relationships } = await supabase.from('relationships').select('*');

  // Run the bundled simulation (compact, Deno-friendly)
  const result = await runDailySimulation(currentState, relationships || []);

    // Persist emotional_state update
    const { error: updateError } = await supabase.from('emotional_state').update({
      primary_emotions: result.newState.primary_emotions,
      mood: result.newState.mood,
      last_event: result.event.description,
      last_event_timestamp: result.timestamp,
      updated_at: result.timestamp
    }).eq('id', currentState.id);

    if (updateError) {
      console.error('Failed to update emotional_state', updateError);
    }

    // Persist relationship updates
    const updatedRelationships: string[] = [];
    for (const rel of result.relationshipUpdates || []) {
      const id = rel.id;
      const { error: relErr } = await supabase.from('relationships').update({
        status: rel.status,
        decay_timer: rel.decay_timer,
        last_interaction: rel.last_interaction || result.timestamp,
        updated_at: result.timestamp
      }).eq('id', id);
      if (!relErr) updatedRelationships.push(rel.entity_name || id);
    }

    return new Response(JSON.stringify({ success: true, event: result.event, dominant_emotion: getDominantEmotion(result.newState.primary_emotions), updated_relationships: updatedRelationships.length, summary: result.summary }), { status: 200 });
  } catch (err) {
    console.error('Daily Awakening Error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
});
