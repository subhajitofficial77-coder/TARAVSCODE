import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { verifyInternalToken } from '@/lib/auth/internal';

export async function POST(request: Request) {
  try {
    // Verify internal token before proceeding
    verifyInternalToken(request);

    const body = await request.json();
    const { date, theme, narrative, mood_summary, emotional_snapshot, quota, inspiration_seeds } = body;

    if (!date || !theme || !inspiration_seeds) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if master plan exists
    const { data: existingPlan, error: checkError } = await supabase
      .from('master_plans')
      .select('id, is_locked')
      .eq('date', date)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      throw checkError;
    }

    if (existingPlan?.is_locked) {
      return NextResponse.json(
        { success: false, error: 'Master plan is locked' },
        { status: 400 }
      );
    }

    // Determine if we're using separate seeds table
    const { data: tableInfo } = await supabase
      .from('inspiration_seeds')
      .select('id')
      .limit(1);

    const usingSeparateTable = tableInfo !== null;

    // Insert/update master plan
    const masterPlanData = {
      date,
      theme,
      narrative,
      mood_summary,
      emotional_snapshot,
      quota,
      ...(usingSeparateTable ? {} : { inspiration_seeds })
    };

    const { data: masterPlan, error: mpError } = existingPlan
      ? await supabase
          .from('master_plans')
          .update(masterPlanData)
          .eq('id', existingPlan.id)
          .select()
          .single()
      : await supabase
          .from('master_plans')
          .insert(masterPlanData)
          .select()
          .single();

    if (mpError) throw mpError;

    // Handle inspiration seeds based on schema
    if (usingSeparateTable) {
      if (existingPlan) {
        // Delete existing seeds
        await supabase
          .from('inspiration_seeds')
          .delete()
          .eq('master_plan_id', existingPlan.id);
      }

      // Insert new seeds
      const { error: seedError } = await supabase
        .from('inspiration_seeds')
        .insert(
          inspiration_seeds.map((seed: any) => ({
            ...seed,
            master_plan_id: masterPlan.id
          }))
        );

      if (seedError) throw seedError;
    }

    return NextResponse.json({
      success: true,
      master_plan: {
        ...masterPlan,
        inspiration_seeds: usingSeparateTable
          ? inspiration_seeds
          : masterPlan.inspiration_seeds
      }
    });

  } catch (error) {
    console.error('Save master plan error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}