import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ContentPlatform, ContentType } from '@/types/database';

// Types for n8n integration

interface N8NRequest {
  seed_id: string;
  platforms: ContentPlatform[];
  formats: ContentType[];
  context: {
    emotional_state: any;
    consciousness: any;
    weather: any;
    master_plan: any;
  };
}

export async function POST(request: Request) {
  try {
    const json: N8NRequest = await request.json();
    const supabase = createServiceRoleClient();

    // 1. Get the inspiration seed details
    const { data: seed } = await supabase
      .from('inspiration_seeds')
      .select('*')
      .eq('id', json.seed_id)
      .single();

    if (!seed) {
      throw new Error('Inspiration seed not found');
    }

    // 2. Format data for n8n
    const webhook_data = {
      seed,
      context: json.context,
      platforms: json.platforms,
      formats: json.formats,
      timestamp: new Date().toISOString()
    };

    // 3. Call n8n webhook
    const n8n_response = await fetch(process.env.N8N_CONTENT_WEBHOOK!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhook_data)
    });

    if (!n8n_response.ok) {
      throw new Error('n8n workflow failed');
    }

    // 4. Get generated content from n8n
    const content = await n8n_response.json();

    // 5. Save to generated_content table
    const { error: saveError } = await supabase
      .from('generated_content')
      .insert({
        inspiration_seed_id: seed.id,
        content,
        status: 'pending_review',
        platforms: json.platforms,
        created_at: new Date().toISOString()
      } as any);

    if (saveError) throw saveError;

    return NextResponse.json({ success: true, content });

  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}