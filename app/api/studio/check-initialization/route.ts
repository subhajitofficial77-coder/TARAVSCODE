import { createServiceRoleClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { MasterPlan, EmotionalState } from '@/types/database';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();
    
    // Check if master_plans table has data for today
    const today = new Date().toISOString().split('T')[0];
    const { data: masterPlan } = await supabase
      .from('master_plans')
      .select('id')
      .eq('date', today)
      .limit(1)
      .single() as { data: MasterPlan | null };
      
    // Check if we have inspiration seeds for today's master plan
    let hasSeeds = false;
    if (masterPlan?.id) {
      const { data: seeds } = await supabase
        .from('inspiration_seeds')
        .select('id')
        .eq('master_plan_id', masterPlan.id)
        .limit(1) as { data: any[] | null };
      hasSeeds = seeds?.length > 0;
    }
    
    // Check if emotional_state exists with valid data
    const { data: emotionalState } = await supabase
      .from('emotional_state')
      .select('primary_emotions,mood,core_traits')
      .limit(1)
      .single() as { data: EmotionalState | null };
    
    const hasValidEmotionalState = !!(emotionalState?.primary_emotions && emotionalState?.mood && emotionalState?.core_traits);
    const initialized = !!(masterPlan && hasSeeds && hasValidEmotionalState);
    
    return NextResponse.json({
      initialized,
      details: {
        hasMasterPlan: !!masterPlan,
        hasValidEmotionalState,
        hasInspirationSeeds: hasSeeds
      }
    });
  } catch (err) {
    console.error('Check initialization error', err);
    return NextResponse.json(
      { initialized: false, error: String(err) },
      { status: 500 }
    );
  }
}