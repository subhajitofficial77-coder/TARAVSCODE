import type { EmotionalState, Relationship, GeneratedContent, ChatMessage } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from './server';

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

    const { error: stateError } = await svc.from('emotional_state').update({
      primary_emotions: result.newState?.primary_emotions,
      mood: result.newState?.mood,
      last_event: result.event?.description,
      last_event_timestamp: result.timestamp,
      updated_at: result.timestamp
    } as any).eq('id', result.newState?.id);

    if (stateError) throw stateError;

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
