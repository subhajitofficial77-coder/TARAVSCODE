import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = createServiceRoleClient();
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // 1. Seed emotional_state if empty
    const { data: existingState } = await (supabase as any)
      .from('emotional_state')
      .select('*')
      .limit(1);

    if (!existingState || existingState.length === 0) {
      await (supabase as any)
        .from('emotional_state')
        .insert({
          primary_emotions: {
            joy: 0.7,
            trust: 0.6,
            anticipation: 0.5,
            sadness: 0.2,
            fear: 0.1,
            anger: 0.1,
            disgust: 0.1,
            surprise: 0.4
          },
          mood: {
            optimism: 0.75,
            energy_level: 0.65,
            stress_level: 0.25
          },
          core_traits: {
            openness: 0.8,
            conscientiousness: 0.7,
            extraversion: 0.6,
            agreeableness: 0.75,
            neuroticism: 0.3
          },
          last_event: 'Woke up feeling inspired and ready to create',
          last_event_timestamp: now
        });
    }

    // 2. Seed relationships if empty
    const { data: existingRelations } = await (supabase as any)
      .from('relationships')
      .select('*')
      .limit(1);

    if (!existingRelations || existingRelations.length === 0) {
      await (supabase as any)
        .from('relationships')
        .insert([{
          entity_name: 'Mother',
          relationship_type: 'family',
          status: 'excellent',
          notes: 'Heartwarming conversations about creativity',
          last_interaction: now
        }, {
          entity_name: 'Priya',
          relationship_type: 'friend',
          status: 'warm',
          notes: 'Shared ideas about art and design',
          last_interaction: now
        }, {
          entity_name: 'Rajesh',
          relationship_type: 'friend',
          status: 'warm',
          notes: 'Discussed poetry and storytelling',
          last_interaction: now
        }]);
    }

    // 3. Create master_plans table if it doesn't exist
    try {
      await (supabase as any).rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS master_plans (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            date date NOT NULL,
            theme text,
            narrative text NOT NULL,
            mood_summary text,
            quota jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
          );
        `
      });
    } catch (tableError) {
      console.warn('Master plans table creation warning:', tableError);
    }

    // 4. Create inspiration_seeds table if it doesn't exist
    try {
      await (supabase as any).rpc('exec_sql', {
        sql: `
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
        `
      });
    } catch (seedsTableError) {
      console.warn('Inspiration seeds table creation warning:', seedsTableError);
    }

    // 5. Seed master_plans for today if missing
    const { data: existingMasterPlan } = await (supabase as any)
      .from('master_plans')
      .select('*')
      .eq('date', today)
      .limit(1);

    if (!existingMasterPlan || existingMasterPlan.length === 0) {
      const { data: planData } = await (supabase as any)
        .from('master_plans')
        .insert({
          date: today,
          theme: 'Creative Connection',
          narrative: 'A beautiful day to celebrate connections and share stories that inspire. The morning air carries whispers of creativity, urging us to explore the delicate balance between personal expression and universal truth.',
          mood_summary: 'Feeling optimistic and energized, ready to create meaningful connections through art.',
          quota: {
            carousel: 2,
            story: 3,
            post: 3,
            caption: 5
          }
        })
        .select()
        .single();

      // 6. Seed inspiration_seeds for the master plan
      if (planData) {
        await (supabase as any)
          .from('inspiration_seeds')
          .insert([{
            master_plan_id: planData.id,
            type: 'carousel',
            label: 'Visual Journey Through Emotions',
            topic: 'How colors and shapes express our inner world',
            priority: 1,
            emotional_context: { joy: 0.8, trust: 0.7, surprise: 0.6 }
          }, {
            master_plan_id: planData.id,
            type: 'story',
            label: 'Morning Reflections',
            topic: 'Finding beauty in daily rituals and quiet moments',
            priority: 2,
            emotional_context: { anticipation: 0.7, joy: 0.6, trust: 0.8 }
          }, {
            master_plan_id: planData.id,
            type: 'post',
            label: 'Creative Bonds',
            topic: 'The power of artistic collaboration and shared inspiration',
            priority: 1,
            emotional_context: { trust: 0.9, joy: 0.7, anticipation: 0.6 }
          }, {
            master_plan_id: planData.id,
            type: 'story',
            label: 'Nature\'s Whispers',
            topic: 'Learning from patterns and rhythms in nature',
            priority: 2,
            emotional_context: { surprise: 0.7, joy: 0.8, anticipation: 0.7 }
          }]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Studio initialized successfully'
    });

  } catch (err) {
    console.error('Auto-seed error:', err);
    return NextResponse.json(
      {
        success: false,
        error: String(err),
        message: 'Failed to initialize studio. Check server logs for details.'
      },
      { status: 500 }
    );
  }
}
