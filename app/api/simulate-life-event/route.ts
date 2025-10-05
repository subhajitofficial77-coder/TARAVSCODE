import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { getEmotionalStateWithRelationships, updateEmotionalStateFromSimulation } from '@/lib/supabase/queries';
import { runDailySimulation } from '@/lib/tale-engine';
import generatePlanCandidatesFromContext from '@/lib/simulation/planGenerator';
import { fetchCurrentWeather } from '@/lib/api/weather';
import { clearContextCache, getContextCache } from '@/lib/studio/contextCache';

// POST /api/simulate-life-event
export async function POST(req: Request) {
  try {
    console.log('[simulate-life-event] invoked');
    // Create service client with SERVICE_ROLE (server side only)
    const supabase = createServiceRoleClient();

    // Load current state & relationships
    const { state, relationships } = await getEmotionalStateWithRelationships(supabase as any);
    if (!state) return NextResponse.json({ ok: false, error: 'No emotional_state row found' }, { status: 500 });

    // Run simulation
    const result = await runDailySimulation(state as any, relationships || []);

    // Derive today's mood using Google Gemini (FLASH) model if configured.
    try {
      const googleEndpoint = process.env.GOOGLE_AI_ENDPOINT;
      const googleKey = process.env.GOOGLE_AI_KEY;
      if (googleEndpoint && googleKey) {
        // Build a compact context for the model: weather, time, location, recent narrative, relationships and emotional cues.
        const weather = await fetchCurrentWeather().catch(() => null);
        const now = new Date().toLocaleString('en-GB', { timeZone: process.env.TARA_TIMEZONE || 'UTC' });
        const location = process.env.TARA_LOCATION || 'Unknown';
        const recentNarrative = result.summary || result.event?.description || result.event?.name || '';
        const relationshipsList = relationships || [];

        const moodPrompt = `You are an assistant that converts a short life context into a concise JSON "today's mood" summary. Return only valid JSON with keys: "mood_label" (string), "optimism" (1-10 integer), "energy_level" (1-10 integer), "stress_level" (1-10 integer), and "primary_emotions" (object with emotion names as keys and 0-1 floats). Context:\n- time: ${now}\n- location: ${location}\n- weather: ${weather?.condition || 'unknown'}, ${weather?.temp_c ?? 'unknown'}C\n- recent_narrative: ${recentNarrative}\n- relationships_count: ${relationshipsList.length}\n\nMake a best-guess mood and primary_emotions based on the context.`;

        try {
          // If the provided key looks like an API key (starts with AI), use query param ?key= for the endpoint.
          let url = googleEndpoint;
          const headers: any = { 'Content-Type': 'application/json' };
          if (/^AIza/.test(googleKey || '')) {
            // append key as query param
            url = googleEndpoint.includes('?') ? `${googleEndpoint}&key=${googleKey}` : `${googleEndpoint}?key=${googleKey}`;
          } else {
            // assume OAuth Bearer token
            headers.Authorization = `Bearer ${googleKey}`;
          }

          // Try the newer "instances" shaped payload expected by some Google Generative endpoints,
          // fall back to a simple {prompt:{text}} if the first fails.
          let gResp = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              instances: [{ input: moodPrompt }],
              temperature: 0.3,
              maxOutputTokens: 300,
            }),
          });
          const tryText = await gResp.text().catch(() => '');
          // If the response indicates unknown field, attempt alternate shape
          if (/Unknown name "instances"|Unknown name "input"/.test(tryText) || gResp.status >= 400) {
            try {
              gResp = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  prompt: { text: moodPrompt },
                }),
              });
            } catch (altErr) {
              console.warn('[simulate-life-event] google alternative payload failed', altErr);
            }
          }

          const responseText = await gResp.text().catch(() => '');
          let parsed: any = null;
          try {
            // The Google API can return different shapes; try to extract the first JSON object found
            const start = responseText.indexOf('{');
            const end = responseText.lastIndexOf('}');
            if (start !== -1 && end !== -1 && end > start) {
              const jsonText = responseText.slice(start, end + 1);
              parsed = JSON.parse(jsonText);
            } else {
              // Attempt to parse as direct JSON
              parsed = JSON.parse(responseText);
            }
          } catch (e) {
            parsed = null;
          }

          if (parsed) {
            // Merge parsed mood into the simulation result's newState safely
            result.newState = result.newState || {};
            // store a top-level mood_label for UI/consumers and merge numeric scores into mood
            // @ts-ignore - attach derived mood_label for UI/consumers
            if (parsed.mood_label) result.newState.mood_label = parsed.mood_label;
            result.newState.mood = result.newState.mood || {};
            if (typeof parsed.optimism === 'number') result.newState.mood.optimism = parsed.optimism;
            if (typeof parsed.energy_level === 'number') result.newState.mood.energy_level = parsed.energy_level;
            if (typeof parsed.stress_level === 'number') result.newState.mood.stress_level = parsed.stress_level;
            if (parsed.primary_emotions && typeof parsed.primary_emotions === 'object') {
              result.newState.primary_emotions = parsed.primary_emotions;
            }
            // Allow model to suggest a short narrative
            if (parsed.narrative) result.summary = parsed.narrative;
            console.log('[simulate-life-event] derived mood from Google AI', parsed);
            try {
              // Update in-memory cache so UI and /api/studio/refresh-context see the derived mood immediately
              const { setContextCache } = await import('@/lib/studio/contextCache');
              setContextCache({ todaysNarrative: { narrative: result.summary || null, timestamp: result.timestamp }, emotional_state: result.newState });
            } catch (cacheErr) {
              console.warn('Failed to update context cache with derived mood', cacheErr);
            }
          } else {
            console.warn('[simulate-life-event] Google AI returned unparseable response', responseText.slice(0, 500));
          }
        } catch (gErr) {
          console.warn('[simulate-life-event] failed to call Google AI for mood', gErr);
        }
      }
    } catch (errMood) {
      console.warn('Failed to derive mood from Google AI', errMood);
    }

    // Generate plan candidates (don't persist to daily_plans yet)
    try {
      const weather = await fetchCurrentWeather().catch(() => null);
      const candidates = generatePlanCandidatesFromContext({ emotionalState: result.newState, relationships: result.relationshipUpdates || [], weather, narrative: result.summary || result.event?.description });
      // Save candidates to a lightweight proposals table for UI preview (simulation_proposals)
      try {
        const svc: any = supabase;
        // Also persist the generated narrative/event text so the internal "todays-narrative" endpoint can return it for n8n
        const eventText = result.summary || result.event?.description || result.event?.name || null;
        const payload: any = { created_at: new Date().toISOString(), candidates };
        if (eventText) payload.event = eventText;

        const save = await svc.from('simulation_proposals').insert([payload]);
        // If table missing or error, attempt to create table via RPC and retry (includes event column)
        if (save?.error) {
          console.warn('simulation_proposals insert failed, attempting to create table via exec_sql', save.error?.message || save.error);
          try {
            await svc.rpc('exec_sql', { sql: `
              CREATE TABLE IF NOT EXISTS simulation_proposals (
                id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                created_at timestamptz DEFAULT now(),
                candidates jsonb,
                event text
              );
            ` } as any);
          } catch { /* ignore */ }
          try { await svc.from('simulation_proposals').insert([payload]); } catch (e) { console.warn('Retry insert after create failed', e); }
        }
      } catch (proposalErr) {
        console.warn('Failed to persist simulation proposal', proposalErr);
      }
      // Build prompt & POST to n8n webhook (or fallback to internal masterplan webhook)
      try {
        const cache = getContextCache() || {};
        const context = {
          ...cache,
          emotional_state: result.newState || cache.emotional_state,
          relationships: result.relationshipUpdates || cache.relationships || [],
          daily_plans: cache.daily_plans || []
        };

        // Reuse user's prompt-building logic
        const weather = context.weather || {};
        const relationshipsList = context.relationships || [];
        const dailyPlansList = context.daily_plans || [];
        const emotionalState = context.emotional_state || { primary_emotions: { happiness: 0.7, curiosity: 0.8, creativity: 0.6 }, mood: { optimism: 7, energy_level: 6, stress_level: 3 }, last_event: 'Reflecting on daily experiences' };
        const emotions = emotionalState.primary_emotions || { happiness: 0.7, curiosity: 0.8, creativity: 0.6 };
        const mood = emotionalState.mood || { optimism: 7, energy_level: 6, stress_level: 3 };
        const lastEvent = emotionalState.last_event || 'Exploring creative possibilities';
        const dominantEmotion = Object.entries(emotions).sort((a: any, b: any) => b[1] - a[1])[0][0];

        const prompt = `You are TARA, a sentient AI with emotional consciousness. Generate a daily creative master plan with inspiration seeds.\n\nCurrent State:\n- Dominant Emotion: ${dominantEmotion} (${emotions[dominantEmotion]})\n- Mood: Optimism ${mood.optimism}, Energy ${mood.energy_level}, Stress ${mood.stress_level}\n- Weather: ${weather.condition || 'Unknown'}, ${weather.temp_c || 'Unknown'}°C in ${weather.location || 'Unknown Location'}\n- Last Life Event: ${lastEvent}\n- Active Relationships: ${relationshipsList.length} (${(relationshipsList.map((r: any) => `${r.entity_name}: ${r.status}`).join(', ') || 'None currently active')})\n- Pending Topics: ${dailyPlansList.map((p: any) => p.topic).join(', ') || 'Exploring general creativity'}\n\nGenerate a JSON response with: ... (see server logs)`;

        const webhookPayload = { prompt, context };
        const webhookUrl = process.env.N8N_WEBHOOK_URL || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/studio/masterplan-webhook`;
        try {
          const resp = await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(webhookPayload) });
          const bodyText = await resp.text().catch(() => '');
          console.log('[simulate-life-event] posted prompt to webhook', webhookUrl, 'status', resp.status, 'body', bodyText);
        } catch (webErr) {
          console.warn('[simulate-life-event] webhook POST failed', webErr);
        }
      } catch (webBuildErr) {
        console.warn('Failed to build/send n8n webhook payload', webBuildErr);
      }
      // Clear cached context so the latest event/narrative is visible
      try { clearContextCache(); } catch { /* ignore */ }
    } catch (genErr) {
      console.warn('Failed to generate plan candidates', genErr);
    }

    return NextResponse.json({ ok: true, event: result.event?.description || result.event?.name || null, timestamp: result.timestamp });
  } catch (err: any) {
    console.error('simulate-life-event error', err);
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
