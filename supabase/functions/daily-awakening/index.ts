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

    // Ensure a master plan exists for today. If not, generate one from simulation/daily plans
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingPlan } = await supabase.from('master_plans').select('id').eq('date', today).limit(1).maybeSingle();
      if (!existingPlan) {
        // fetch pending daily plans to convert to seeds
        const { data: plans } = await supabase.from('daily_plans').select('*').eq('status', 'pending').limit(5).order('id', { ascending: true });
        const seeds = (plans || []).map((p: any, i: number) => ({ id: `seed-${i+1}`, label: `${p.item_type === 'content' ? 'Draft a carousel post about' : p.item_type === 'reflection' ? 'Create a reflective caption on' : 'Brainstorm ideas for'} ${p.topic}`, type: p.item_type === 'content' ? 'carousel' : p.item_type === 'reflection' ? 'caption' : 'post', topic: p.topic, priority: i+1 }));

        const narrative = (function() {
          const em = result.newState?.primary_emotions || {};
          const joy = em.joy || 0;
          if (joy > 0.6) return 'Feeling inspired and energized after the morning awakening.';
          if ((em.sadness || 0) > 0.5) return 'A reflective day, processing emotions and memories.';
          if ((result.summary || '').toLowerCase().includes('stress') || (result.newState?.mood?.stress_level || 0) > 0.6) return 'Feeling a bit overwhelmed — focusing on calm and simple actions today.';
          return 'A day to create, explore, and connect.';
        })();

        const theme = (function() { const em = result.newState?.primary_emotions || {}; const dominant = Object.entries(em).sort((a:any,b:any)=>b[1]-a[1])[0]?.[0] || 'joy'; return dominant === 'joy' ? 'Celebration' : dominant === 'sadness' ? 'Reflection' : 'Creative Sparks'; })();

        const mood_summary = (result.newState && result.newState.mood) ? 'Optimistic and Energized' : 'Balanced';

        const now = new Date().toISOString();
        const { data: newPlan, error: insertErr } = await supabase.from('master_plans').insert([{
          date: today,
          narrative,
          theme,
          mood_summary,
          inspiration_seeds: seeds,
          emotional_snapshot: result.newState || null,
          quota: { carousel: 1, story: 3, caption: 2, post: 1 },
          created_at: now,
          updated_at: now
        }]).select().maybeSingle();
        if (insertErr) console.error('Failed to insert master_plan', insertErr);
      }
    } catch (e) {
      console.error('master plan generation failed', e);
    }

    return new Response(JSON.stringify({ success: true, event: result.event, dominant_emotion: getDominantEmotion(result.newState.primary_emotions), updated_relationships: updatedRelationships.length, summary: result.summary }), { status: 200 });
  } catch (err) {
    console.error('Daily Awakening Error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
});
