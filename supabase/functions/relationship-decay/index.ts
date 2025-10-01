import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Supabase env vars' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: relationships } = await supabase.from('relationships').select('*').not('decay_timer', 'is', null);
    const now = new Date();
    const updated: string[] = [];

    for (const rel of relationships || []) {
      const decay = new Date(rel.decay_timer);
      if (now >= decay) {
        await supabase.from('relationships').update({ status: 'neutral', decay_timer: null, updated_at: now.toISOString() }).eq('id', rel.id);
        updated.push(rel.entity_name);
      }
    }

    return new Response(JSON.stringify({ success: true, checked: relationships?.length || 0, updated: updated.length, healed_relationships: updated }), { status: 200 });
  } catch (err) {
    console.error('Relationship Decay Error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
});
