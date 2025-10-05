import type { SupabaseClient } from '@supabase/supabase-js';

export async function getTodaysMasterPlanWithSeeds(supabase: SupabaseClient) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const planResp: any = await supabase
      .from('master_plans')
      .select('*')
      .eq('date', today)
      .limit(1)
      .single();
    let plan: any = planResp.data;
    const planError: any = planResp.error;

    if (planError) {
      // If no plan exists for today, try to create one
      const newPlan = {
        date: today,
        theme: 'Creative Expression Journey',
        narrative: 'A journey through various creative mediums, exploring emotions and stories',
        emotional_context: {
          optimism: 0.8,
          energy: 0.7,
          focus: 0.9
        }
      };

      const createdResp: any = await supabase
        .from('master_plans')
        .insert(newPlan)
        .select()
        .single();
      const createdPlan: any = createdResp.data;
      const createError: any = createdResp.error;

      if (createError) {
        console.error('Failed to create master plan:', createError);
        return null;
      }

      plan = createdPlan;
    }

    if (plan?.id) {
      // Get inspiration seeds for this plan
      const { data: seeds, error: seedsError } = await supabase
        .from('inspiration_seeds')
        .select('*')
        .eq('master_plan_id', plan.id)
        .order('priority');

      if (seedsError) {
        console.error('Failed to fetch inspiration seeds:', seedsError);
        return { ...plan, inspiration_seeds: [] };
      }

      // If no seeds exist, create some
  if (!seeds?.length) {
        const newSeeds = [{
          master_plan_id: plan.id,
          type: 'carousel',
          label: 'Visual Journey Through Emotions',
          topic: 'art_exploration',
          priority: 1,
          emotional_context: { joy: 0.8, trust: 0.7, surprise: 0.6 }
        }, {
          master_plan_id: plan.id,
          type: 'story',
          label: 'Personal Growth Narrative',
          topic: 'self_reflection',
          priority: 2,
          emotional_context: { trust: 0.9, anticipation: 0.7, joy: 0.6 }
        }, {
          master_plan_id: plan.id,
          type: 'prompt',
          label: 'Creative Writing Exercise',
          topic: 'writing',
          priority: 3,
          emotional_context: { anticipation: 0.8, surprise: 0.6, trust: 0.7 }
        }];

        const { data: createdSeeds, error: createSeedsError } = await supabase
          .from('inspiration_seeds')
          .insert(newSeeds)
          .select();

        if (createSeedsError) {
          console.error('Failed to create inspiration seeds:', createSeedsError);
          return { ...plan, inspiration_seeds: [] };
        }

        return { ...plan, inspiration_seeds: createdSeeds };
      }

      return { ...plan, inspiration_seeds: seeds };
    }

    return null;
  } catch (err) {
    console.error('getTodaysMasterPlanWithSeeds error:', err);
    return null;
  }
}