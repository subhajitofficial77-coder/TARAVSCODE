import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { workflow_id, data } = json;

    const supabase = createServiceRoleClient();

    switch (workflow_id) {
      case 'daily-master-plan':
        // Handle new master plan data
        const { master_plan, seeds } = data;
        
        // Save master plan
        const { data: planData, error: planError } = await supabase
          .from('master_plans')
          .insert(master_plan)
          .select()
          .single();

        if (planError) throw planError;

        // Save seeds
        if (planData?.id) {
          const seedsWithPlanId = seeds.map((seed: any) => ({
            ...seed,
            master_plan_id: planData.id
          }));

          const { error: seedError } = await supabase
            .from('inspiration_seeds')
            .insert(seedsWithPlanId);

          if (seedError) throw seedError;
        }
        break;

      case 'content-generation':
        // Handle generated content
        const { content } = data;
        const { error: contentError } = await supabase
          .from('generated_content')
          .insert(content);

        if (contentError) throw contentError;
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('n8n webhook error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}