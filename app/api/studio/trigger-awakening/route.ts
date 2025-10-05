import { NextResponse } from 'next/server';
import { triggerDailyAwakening } from '@/lib/n8n/workflows';
import type { MasterPlan } from '@/types/studio';

export async function POST(request: Request) {
  try {
    // Optional force parameter from request body
    const { force } = await request.json();
    
    // Trigger the n8n workflow
    const masterPlan: MasterPlan = await triggerDailyAwakening({
      force: force === true
    });

    return NextResponse.json(masterPlan);
  } catch (error) {
    console.error('Daily awakening trigger failed:', error);
    return NextResponse.json(
      { error: 'Failed to trigger daily awakening' },
      { status: 500 }
    );
  }
}