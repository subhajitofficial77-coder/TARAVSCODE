import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Add Deno types
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined
    }
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json"
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Supabase env vars' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { global: { headers: { 'x-llm-source': 'studio-context' } } });

    // Fetch emotional state
    const { data: emotionalState, error: esErr } = await supabase
      .from('emotional_state')
      .select('*')
      .limit(1)
      .single()
    
    if (esErr) {
      console.error('emotional state fetch error', esErr)
      // Continue with null emotional state
    }

    // Fetch latest master plan
    let masterPlanData = null;
    let mpErr = null;
    try {
      const result = await supabase
        .from('master_plans')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      masterPlanData = result.data;
      mpErr = result.error;
    } catch (error) {
      console.warn('Master plan fetch warning:', error);
      mpErr = error;
    }

    const masterPlan = mpErr ? null : masterPlanData;

    // Fetch relationships
    const { data: relationships, error: relErr } = await supabase
      .from('relationships')
      .select('*')
      .order('entity_name')
    
    if (relErr) {
      console.error('relationships fetch error', relErr)
      // Continue with empty relationships
    }

    // Fetch inspiration seeds for today's master plan
    let inspirationSeeds = []
    if (masterPlan?.id) {
      try {
        const { data: seeds, error: seedErr } = await supabase
          .from('inspiration_seeds')
          .select('*')
          .eq('master_plan_id', masterPlan.id)
          .order('priority', { ascending: true })

        if (seedErr) {
          console.error('inspiration seeds fetch error', seedErr)
        } else {
          inspirationSeeds = seeds || []
        }
      } catch (error) {
        console.warn('Inspiration seeds fetch warning:', error)
      }
    }

    // Fetch pending daily plans
    let dailyPlans = []
    try {
      const { data: plans, error: dpErr } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('status', 'pending')
        .limit(10)
        .order('id', { ascending: true })

      if (dpErr) {
        console.error('daily plans fetch error', dpErr)
      } else {
        dailyPlans = plans || []
      }
    } catch (error) {
      console.warn('Daily plans fetch warning:', error)
    }

    let weather = null
    try {
      const apiKey = Deno.env.get("WEATHER_API_KEY")
      const endpoint = Deno.env.get("WEATHER_API_ENDPOINT") || "https://api.weatherapi.com/v1"
      const location = Deno.env.get("TARA_LOCATION") || "Indore,India"
      
      if (apiKey) {
        const url = `${endpoint}/current.json?key=${apiKey}&q=${encodeURIComponent(location)}&aqi=no`
        const wres = await fetch(url)
        if (wres.ok) {
          const jw = await wres.json()
          weather = {
            temp_c: jw?.current?.temp_c ?? null,
            condition: jw?.current?.condition?.text ?? null,
            location: jw?.location?.name || location
          }
        }
      }
    } catch (e) {
      console.warn("weather fetch failed", e)
    }

    if (!weather) {
      weather = { temp_c: 28, condition: 'Partly cloudy', location: 'Indore' };
    }

    const context = {
      emotional_state: emotionalState ?? null,
      master_plan: masterPlan ?? null,
      tale_event: {
        description: emotionalState?.last_event ?? null,
        timestamp: emotionalState?.last_event_timestamp ?? null,
      },
      relationships: relationships ?? [],
      daily_plans: dailyPlans ?? [],
      weather,
      timestamp: new Date().toISOString(),
    };

    // Note: CORS headers are already defined at the top of the file

    return new Response(JSON.stringify({ success: true, context }), { 
      status: 200, 
      headers: corsHeaders 
    });
  } catch (err) {
    console.error('studio-context error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { 
      status: 500, 
      headers: corsHeaders
    });
  }
});
