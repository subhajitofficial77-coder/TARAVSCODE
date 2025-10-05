import type { EmotionalState, Relationship, GeneratedContent, ChatMessage } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from './server';
import { initializeIfNeeded } from './queries/initialize';
import { getTodaysMasterPlanWithSeeds } from './queries/masterPlan';

/**
 * Fetch the single emotional state row (Phase 1 assumes single row)
 */
export async function getEmotionalState(supabase: SupabaseClient): Promise<EmotionalState | null> {
  try {
    const { data, error } = await supabase.from('emotional_state').select('*').limit(1).single();
    if (error) {
      console.error('getEmotionalState error', error);
      return null;
    }
    return data as EmotionalState;
  } catch (err) {
    console.error('getEmotionalState exception', err);
    return null;
  }
}

export async function updateEmotionalState(supabase: SupabaseClient, updates: Partial<EmotionalState>): Promise<EmotionalState | null> {
  try {
  const service = createServiceRoleClient();
  const svc: any = service;
  const { data, error } = await svc.from('emotional_state').update(updates as any).select().limit(1).single();
    if (error) {
      console.error('updateEmotionalState error', error);
      return null;
    }
    return data as EmotionalState;
  } catch (err) {
    console.error('updateEmotionalState exception', err);
    return null;
  }
}

export async function getRelationships(supabase: SupabaseClient): Promise<Relationship[]> {
  try {
    const { data, error } = await supabase.from('relationships').select('*').order('entity_name');
    if (error) {
      console.error('getRelationships error', error);
      return [];
    }
    return (data as Relationship[]) || [];
  } catch (err) {
    console.error('getRelationships exception', err);
    return [];
  }
}

export async function getRelationshipByName(supabase: SupabaseClient, name: string): Promise<Relationship | null> {
  try {
    const { data, error } = await supabase.from('relationships').select('*').eq('entity_name', name).limit(1).single();
    if (error) return null;
    return data as Relationship;
  } catch (err) {
    console.error('getRelationshipByName exception', err);
    return null;
  }
}

export async function updateRelationshipStatus(supabase: SupabaseClient, name: string, status: string): Promise<Relationship | null> {
  try {
  const service = createServiceRoleClient();
  const svc: any = service;
  const { data, error } = await svc.from('relationships').update({ status, updated_at: new Date().toISOString() } as any).eq('entity_name', name).select().limit(1).single();
    if (error) {
      console.error('updateRelationshipStatus error', error);
      return null;
    }
    return data as Relationship;
  } catch (err) {
    console.error('updateRelationshipStatus exception', err);
    return null;
  }
}

export async function getGeneratedContent(supabase: SupabaseClient, limit = 20): Promise<GeneratedContent[]> {
  try {
    const { data, error } = await supabase.from('generated_content').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) return [];
    return (data as GeneratedContent[]) || [];
  } catch (err) {
    console.error('getGeneratedContent exception', err);
    return [];
  }
}

export async function saveGeneratedContent(supabase: SupabaseClient, content: Partial<GeneratedContent>): Promise<GeneratedContent | null> {
  try {
    const { data, error } = await supabase.from('generated_content').insert(content).select().limit(1).single();
    if (error) {
      console.error('saveGeneratedContent error', error);
      return null;
    }
    return data as GeneratedContent;
  } catch (err) {
    console.error('saveGeneratedContent exception', err);
    return null;
  }
}

export async function updateGeneratedContent(supabase: SupabaseClient, id: string, updates: Partial<GeneratedContent>): Promise<GeneratedContent | null> {
  try {
    const service = createServiceRoleClient();
    const svc: any = service;
    const { data, error } = await svc.from('generated_content').update(updates as any).eq('id', id).select().limit(1).single();
    if (error) {
      console.error('updateGeneratedContent error', error);
      return null;
    }
    return data as GeneratedContent;
  } catch (err) {
    console.error('updateGeneratedContent exception', err);
    return null;
  }
}

export async function getChatHistory(supabase: SupabaseClient, limit = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase.from('chat_history').select('*').order('created_at', { ascending: true }).limit(limit);
    if (error) return [];
    return (data as ChatMessage[]) || [];
  } catch (err) {
    console.error('getChatHistory exception', err);
    return [];
  }
}

export async function saveChatMessage(supabase: SupabaseClient, message: Partial<ChatMessage>): Promise<ChatMessage | null> {
  try {
    const { data, error } = await supabase.from('chat_history').insert(message).select().limit(1).single();
    if (error) return null;
    return data as ChatMessage;
  } catch (err) {
    console.error('saveChatMessage exception', err);
    return null;
  }
}

// TALE-specific helpers (lightweight, avoid depending on non-existent types/tale)
export async function getEmotionalStateWithRelationships(supabase: SupabaseClient): Promise<{ state: EmotionalState | null; relationships: Relationship[] }> {
  try {
    const [{ data: state }, { data: relationships }] = await Promise.all([
      supabase.from('emotional_state').select('*').limit(1).single(),
      supabase.from('relationships').select('*').order('entity_name')
    ]);
    return { state: state as EmotionalState, relationships: (relationships as Relationship[]) || [] };
  } catch (err) {
    console.error('getEmotionalStateWithRelationships error', err);
    return { state: null, relationships: [] };
  }
}

export async function updateEmotionalStateFromSimulation(supabase: SupabaseClient, result: any): Promise<boolean> {
  try {
    const service = createServiceRoleClient();
    const svc: any = service;

    // Try updating including updated_at if present. Some schemas may not include updated_at
    // (older installs) so we gracefully retry without that field on a PGRST204 missing-column error.
    const baseUpdate: any = {
      primary_emotions: result.newState?.primary_emotions,
      mood: result.newState?.mood,
      last_event: result.event?.description,
      last_event_timestamp: result.timestamp
    };

    try {
      const { error: stateError } = await svc.from('emotional_state').update({ ...baseUpdate, updated_at: result.timestamp } as any).eq('id', result.newState?.id);
      if (stateError) throw stateError;
    } catch (err: any) {
      // If the error indicates the updated_at column is missing, retry without it
      const msg = (err && (err.message || err.error || err.msg || JSON.stringify(err))) as string;
      const code = err?.code || err?.status || null;
      if (code === 'PGRST204' || (typeof msg === 'string' && msg.includes("Could not find the 'updated_at'"))) {
        try {
          const { error: retryErr } = await svc.from('emotional_state').update(baseUpdate as any).eq('id', result.newState?.id);
          if (retryErr) throw retryErr;
        } catch (retryErr) {
          console.error('updateEmotionalStateFromSimulation retry error (no updated_at):', retryErr);
          throw retryErr;
        }
      } else {
        console.error('updateEmotionalStateFromSimulation error:', err);
        throw err;
      }
    }

    for (const rel of result.relationshipUpdates || []) {
      const { error: relError } = await svc.from('relationships').update({
        status: rel.status,
        decay_timer: rel.decay_timer,
        last_interaction: result.timestamp,
        updated_at: result.timestamp
      } as any).eq('entity_name', rel.entity_name);
      if (relError) throw relError;
    }

    return true;
  } catch (err) {
    console.error('updateEmotionalStateFromSimulation error:', err);
    return false;
  }
}

export async function getRelationshipsNeedingDecay(supabase: SupabaseClient): Promise<Relationship[]> {
  try {
    const { data, error } = await supabase.from('relationships').select('*').lte('decay_timer', new Date().toISOString()).not('decay_timer', 'is', null);
    if (error) {
      console.error('getRelationshipsNeedingDecay error', error);
      return [];
    }
    return (data as Relationship[]) || [];
  } catch (err) {
    console.error('getRelationshipsNeedingDecay exception', err);
    return [];
  }
}

export async function applyRelationshipDecay(supabase: SupabaseClient, relationshipId: string): Promise<Relationship | null> {
  try {
  const service = createServiceRoleClient();
  const svc: any = service;
  const { data, error } = await svc.from('relationships').update({ status: 'neutral', decay_timer: null, updated_at: new Date().toISOString() } as any).eq('id', relationshipId).select().limit(1).single();
    if (error) {
      console.error('applyRelationshipDecay error', error);
      return null;
    }
    return data as Relationship;
  } catch (err) {
    console.error('applyRelationshipDecay exception', err);
    return null;
  }
}

export async function getEmotionalHistory(supabase: SupabaseClient, days = 7) {
  // TODO: implement once emotional_state_history table exists
  return [] as any[];
}

export async function getContentById(supabase: SupabaseClient, id: string) {
  try {
    const { data, error } = await supabase.from('generated_content').select('*').eq('id', id).limit(1).single();
    if (error) return null;
    return data as GeneratedContent;
  } catch (err) {
    console.error('getContentById exception', err);
    return null;
  }
}

import type { MasterPlan, StudioContext, InspirationSeed } from '@/types/database';
import { getContextCache } from '@/lib/studio/contextCache';

export async function getLatestMasterPlan(supabase: SupabaseClient): Promise<MasterPlan | null> {
  try {
    const { data, error } = await supabase
      .from('master_plans')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    if (error) {
      console.error('getLatestMasterPlan error', error);
      return null;
    }
    return data as MasterPlan;
  } catch (err) {
    console.error('getLatestMasterPlan exception', err);
    return null;
  }
}

export async function saveMasterPlan(supabase: SupabaseClient, plan: Partial<MasterPlan>): Promise<MasterPlan | null> {
  try {
    const service = createServiceRoleClient();
    const svc: any = service;
    const { data, error } = await svc
      .from('master_plans')
      .insert(plan as any)
      .select()
      .limit(1)
      .single();
    if (error) {
      console.error('saveMasterPlan error', error);
      return null;
    }
    return data as MasterPlan;
  } catch (err) {
    console.error('saveMasterPlan exception', err);
    return null;
  }
}

export async function getStudioContext(retryOnFailure: boolean = true): Promise<StudioContext | null> {
  try {
    const supabase = createServiceRoleClient();

    // Get emotional state
    const emotionalState = await getEmotionalState(supabase);
    if (!emotionalState && retryOnFailure) {
      await initializeIfNeeded();
      return getStudioContext(false);
    }

    // Get today's master plan and seeds
    const masterPlanWithSeeds = await getTodaysMasterPlanWithSeeds(supabase);
    if (!masterPlanWithSeeds && retryOnFailure) {
      await initializeIfNeeded();
      return getStudioContext(false);
    }

    // Get relationships
    const relationships = await getRelationships(supabase);
    
    // Try to get weather data if available
    let weather = null;
    try {
      const weatherRes = await fetch('https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=auto:ip');
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        weather = {
          temp_c: data.current.temp_c,
          condition: data.current.condition.text,
          location: `${data.location.name}, ${data.location.region}`
        };
      }
    } catch (err) {
      console.warn('Weather fetch failed:', err);
    }

    // If an in-memory cached narrative exists (set by persist-narrative), include it as a tale_event
  const cached = getContextCache();
  // If cache contains an emotional_state (set by simulate or persist-narrative), prefer it so clients see immediate changes
  const emotional_state = cached?.emotional_state ? cached.emotional_state : emotionalState;
  const tale_event = cached?.todaysNarrative ? { description: cached.todaysNarrative.narrative, timestamp: cached.todaysNarrative.timestamp } : null;

    return {
      emotional_state,
      master_plan: masterPlanWithSeeds,
      relationships,
      weather,
      tale_event
    } as any;

  } catch (error) {
    console.error('Studio context fetch failed:', error);
    
    if (!retryOnFailure) {
      return null;
    }

    // Attempt auto-seeding directly using service role RPC (avoid server-side fetch to app route)
    try {
      console.log('Attempting auto-seed via exec_sql...');
      const svc = createServiceRoleClient();
      // Create minimal tables if missing
      await svc.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS emotional_state (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          primary_emotions jsonb DEFAULT '{}',
          mood jsonb DEFAULT '{}',
          last_event text,
          last_event_timestamp timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      ` } as any);

      await svc.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS relationships (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          entity_name text UNIQUE,
          status text,
          decay_timer timestamptz,
          last_interaction timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      ` } as any);

      await svc.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS master_plans (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          date date NOT NULL,
          theme text,
          narrative text,
          mood_summary text,
          quota jsonb DEFAULT '{}',
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      ` } as any);

      await svc.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS simulation_proposals (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          title text,
          narrative text,
          payload jsonb DEFAULT '{}',
          created_at timestamptz DEFAULT now()
        );
      ` } as any);

      await svc.rpc('exec_sql', { sql: `
        CREATE TABLE IF NOT EXISTS inspiration_seeds (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          master_plan_id uuid REFERENCES master_plans(id) ON DELETE CASCADE,
          type text NOT NULL,
          label text NOT NULL,
          topic text,
          priority integer DEFAULT 1,
          emotional_context jsonb DEFAULT '{}',
          created_at timestamptz DEFAULT now()
        );
      ` } as any);

      console.log('Auto-seed via exec_sql completed, retrying context fetch...');
      return getStudioContext(false);
    } catch (seedError) {
      console.error('Auto-seed attempt failed:', seedError);
      return null;
    }
  }
}

export async function updateContentFeedback(supabase: SupabaseClient, contentId: string, feedbackItems: any[]) {
  try {
    const service = createServiceRoleClient();
    const svc: any = service;
    for (const f of feedbackItems) {
      const { error } = await svc.from('content_feedback').insert({
        content_id: contentId,
        user_id: f.user_id || null,
        category: f.category,
        score: f.score,
        comment: f.comment || null,
        created_at: new Date().toISOString()
      } as any);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.error('updateContentFeedback error', err);
    return false;
  }
}

export async function updateEmotionalStateFromFeedback(supabase: SupabaseClient, userId: string, newState: any) {
  try {
    const service = createServiceRoleClient();
    const svc: any = service;
    const { data, error } = await svc.from('emotional_state').update({
      primary_emotions: newState.primary_emotions,
      mood: newState.mood,
      updated_at: newState.updated_at
    } as any).eq('user_id', userId).select().limit(1).single();
    if (error) throw error;
    return data as EmotionalState;
  } catch (err) {
    console.error('updateEmotionalStateFromFeedback error', err);
    return null;
  }
}
