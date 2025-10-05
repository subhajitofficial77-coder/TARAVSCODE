import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildCarouselPrompt, buildStoryPrompt, buildCaptionPrompt, buildPostPrompt } from '@/lib/prompts/content-prompts';
import { callOpenRouter } from '@/lib/openrouter';
import { callGoogleAI } from '@/lib/api/google-ai';
import { parseAIResponse } from '@/lib/content-handlers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveGeneratedContent, getEmotionalState } from '@/lib/supabase/queries';
import { fetchCurrentWeather } from '@/lib/api/weather';
import { createClient } from '@supabase/supabase-js';
import type { ContentGenerationRequest, ContentGenerationResponse } from '@/types/content';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ContentGenerationRequest;
    if (!body || !body.contentType || !body.platform) return NextResponse.json({ success: false, error: 'Missing contentType or platform' } as ContentGenerationResponse, { status: 400 });

    // Build prompt based on requested contentType and include current emotional context
    const supabase = createServerSupabaseClient();
    const emotionalContext = await getEmotionalState(supabase);

    // Fetch some extra context: daily plan topics and weather (best-effort)
    let dailyPlan: string[] | null = null;
    try {
      // lightweight read via client (non-service) to respect RLS
      const PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const PUBLIC_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (PUBLIC_URL && PUBLIC_KEY) {
        const client = createClient(PUBLIC_URL, PUBLIC_KEY);
        const { data: dpData } = await client.from('daily_plans').select('topic').order('id', { ascending: true }).limit(5);
        dailyPlan = Array.isArray(dpData) ? dpData.map((r: any) => r.topic).filter(Boolean) : null;
      }
    } catch (e) {
      console.warn('Failed to load daily plan for prompt context', e);
      dailyPlan = null;
    }

    let weather = null;
    try {
      weather = await fetchCurrentWeather();
    } catch (e) {
      weather = null;
    }

    const builder =
      body.contentType === 'carousel' ? buildCarouselPrompt :
      body.contentType === 'story' ? buildStoryPrompt :
      body.contentType === 'caption' ? buildCaptionPrompt :
      buildPostPrompt;

    // Extract optional seed context and refinement fields from the request
    const { seedId, seedLabel, seedTopic, parentId, refinementNotes } = (body as any) || {};
    const seedContext = seedId || seedLabel || seedTopic ? { seedId, seedLabel, seedTopic } : undefined;

    // If refinement requested, load parent content for context
    let parentContent: any = null;
    let parentEmotions: any = null;
    if (parentId) {
      try {
        const { data: parentRows } = await supabase.from('generated_content').select('*').eq('id', parentId).limit(1).single();
        if (parentRows) {
          const pr: any = parentRows as any;
          parentContent = pr.content_data;
          parentEmotions = pr.emotional_context || null;
        }
      } catch (e) {
        console.warn('Failed to load parent content for refinement', e);
      }
    }

    const refinementContext = parentId || refinementNotes ? { parentId, refinementNotes, parentContent, parentEmotions } : undefined;

    // Pass context through — keep backward-compatible signature while adding optional seedContext and refinementContext
    const prompt = builder(body, emotionalContext, dailyPlan, weather, emotionalContext?.last_event || null, seedContext, refinementContext);

  // Attempt OpenRouter first, fallback to Google AI
    let aiText: string | null = null;
    let provider: 'openrouter' | 'google-ai' | null = null;

    try {
      aiText = await callOpenRouter([{ role: 'system', content: prompt.prompt }], { temperature: 0.8, maxTokens: prompt.maxTokens });
      provider = 'openrouter';
    } catch (err) {
      console.warn('OpenRouter failed, falling back to Google AI', err);
      try {
        aiText = await callGoogleAI([{ role: 'system', content: prompt.prompt }]);
        provider = 'google-ai';
      } catch (err2) {
        console.error('Both AI providers failed', err2);
        return NextResponse.json({ success: false, error: 'AI generation failed' } as ContentGenerationResponse, { status: 500 });
      }
    }

  if (!aiText) return NextResponse.json({ success: false, error: 'Empty AI response' } as ContentGenerationResponse, { status: 500 });

    // Parse and validate
    let parsed;
    try {
      parsed = parseAIResponse(aiText);
    } catch (err) {
      console.error('Failed to parse AI response', err);
      return NextResponse.json({ success: false, error: 'Failed to parse AI response' } as ContentGenerationResponse, { status: 500 });
    }

    // Persist generated content — map parsed fields to DB column names
  const generatedContext = { emotional_context: emotionalContext || null, daily_plan: dailyPlan, weather, seed: seedContext || null, refinement: refinementContext || null };
    // Save the final prompt (for debugging) and a small preview of the model response
    const promptForSave = (prompt && (prompt as any).prompt) ? (prompt as any).prompt : undefined;
    const modelPreview = aiText ? (aiText.length > 800 ? aiText.slice(0, 800) + '...' : aiText) : undefined;

    const saved = await saveGeneratedContent(supabase, {
      content_type: parsed.contentType,
      content_data: parsed.data,
      platform: parsed.platform,
      provider: provider,
      emotional_context: emotionalContext || null,
  metadata: { ...(parsed.metadata || {}), generated_with_context: { ...generatedContext, prompt: promptForSave, model_preview: modelPreview, seed: seedContext || null } },
      created_at: new Date().toISOString()
    } as any);

    if (!saved) return NextResponse.json({ success: false, error: 'Failed to save content' } as ContentGenerationResponse, { status: 500 });

    return NextResponse.json({ success: true, content: saved, provider } as ContentGenerationResponse);
  } catch (err) {
    console.error('generate-content route error', err);
    return NextResponse.json({ success: false, error: String(err) } as ContentGenerationResponse, { status: 500 });
  }
}
