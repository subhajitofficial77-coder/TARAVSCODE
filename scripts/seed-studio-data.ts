#!/usr/bin/env tsx
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  try {
    // Emotional state
    let stateRes = await supabase.from('emotional_state').select('*').limit(1).single();
    const state = stateRes.data;
    if (!state) {
      console.log('Seeding default emotional_state...');
      const now = new Date().toISOString();
      await supabase.from('emotional_state').insert([
        {
          primary_emotions: { joy: 0.7, trust: 0.6, anticipation: 0.5, sadness: 0.2, fear: 0.1, anger: 0.1, disgust: 0.1, surprise: 0.4 },
          mood: { optimism: 0.75, energy_level: 0.65, stress_level: 0.25 },
          core_traits: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.6, agreeableness: 0.75, neuroticism: 0.3 },
          last_event: 'Woke up feeling inspired and ready to create',
          last_event_timestamp: now,
          created_at: now,
          updated_at: now
        }
      ]);
    } else {
      console.log('Emotional state exists, skipping.');
    }

    // Relationships
    let relsRes = await supabase.from('relationships').select('*').limit(1);
    const rels = relsRes.data;
    if (!rels || rels.length === 0) {
      console.log('Seeding relationships...');
      const now = new Date().toISOString();
      await supabase.from('relationships').insert([
        { entity_name: 'Mother', entity_type: 'family', status: 'excellent', last_interaction: now, created_at: now, updated_at: now },
        { entity_name: 'Priya', entity_type: 'friend', status: 'warm', last_interaction: new Date(Date.now()-86400000).toISOString(), created_at: now, updated_at: now },
        { entity_name: 'Rajesh', entity_type: 'colleague', status: 'warm', last_interaction: new Date(Date.now()-2*86400000).toISOString(), created_at: now, updated_at: now }
      ]);
    } else {
      console.log('Relationships exist, skipping.');
    }

    // Daily plans
    let plansRes = await supabase.from('daily_plans').select('*').limit(1);
    const plans = plansRes.data;
    if (!plans || plans.length === 0) {
      console.log('Seeding daily_plans...');
      const now = new Date().toISOString();
      await supabase.from('daily_plans').insert([
        { item_type: 'content', topic: 'Mother-daughter relationships', status: 'pending', created_at: now, updated_at: now },
        { item_type: 'content', topic: 'Personal growth and resilience', status: 'pending', created_at: now, updated_at: now },
        { item_type: 'content', topic: 'Creative inspiration', status: 'pending', created_at: now, updated_at: now },
        { item_type: 'reflection', topic: 'Morning gratitude practice', status: 'pending', created_at: now, updated_at: now },
        { item_type: 'learning', topic: 'Explore new storytelling techniques', status: 'pending', created_at: now, updated_at: now }
      ]);
    } else {
      console.log('Daily plans exist, skipping.');
    }

    // Master plan for today
    const today = new Date().toISOString().split('T')[0];
    let existingPlanRes = await supabase.from('master_plans').select('*').eq('date', today).limit(1).maybeSingle();
    const existingPlan = existingPlanRes.data;
    if (!existingPlan) {
      console.log('Creating master plan for today...');
      // read emotional state to snapshot
      const csRes = await supabase.from('emotional_state').select('*').limit(1).single();
      const currentState = csRes.data;
      const narrative = "A beautiful day to celebrate connections. I'm feeling inspired by the warmth of family bonds and want to create content that honors those relationships. The weather is pleasant, and my energy is high—perfect for crafting heartfelt stories.";
      const seeds = [
        { id: 'seed-1', label: 'Draft a carousel post about mother-daughter bonds', type: 'carousel', topic: 'Mother-daughter relationships', priority: 1 },
        { id: 'seed-2', label: 'Write 3 Instagram story questions about family traditions', type: 'story', topic: 'Family traditions and memories', priority: 2 },
        { id: 'seed-3', label: 'Create a caption celebrating personal growth', type: 'caption', topic: 'Personal growth and resilience', priority: 3 },
        { id: 'seed-4', label: 'Brainstorm visual ideas for a gratitude post', type: 'post', topic: 'Morning gratitude practice', priority: 4 }
      ];
      const now = new Date().toISOString();
      await supabase.from('master_plans').insert([
        {
          date: today,
          narrative,
          theme: 'Heartfelt Connections',
          mood_summary: 'Optimistic and Energized',
          inspiration_seeds: seeds,
          emotional_snapshot: currentState ?? null,
          quota: { carousel: 1, story: 3, caption: 2, post: 1 },
          created_at: now,
          updated_at: now
        }
      ]);
    } else {
      console.log('Master plan exists for today, skipping.');
    }

    console.log('Studio seed complete ✅');
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

main();
