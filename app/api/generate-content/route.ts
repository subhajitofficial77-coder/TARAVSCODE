import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildCarouselPrompt, buildStoryPrompt, buildCaptionPrompt, buildPostPrompt } from '@/lib/prompts/content-prompts';
import { callOpenRouter } from '@/lib/openrouter';
import { callGoogleAI } from '@/lib/api/google-ai';
import { parseAIResponse } from '@/lib/content-handlers';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveGeneratedContent, getEmotionalState } from '@/lib/supabase/queries';
import type { ContentGenerationRequest, ContentGenerationResponse } from '@/types/content';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ContentGenerationRequest;
    if (!body || !body.contentType || !body.platform) return NextResponse.json({ success: false, error: 'Missing contentType or platform' } as ContentGenerationResponse, { status: 400 });

    // Build prompt based on requested contentType and include current emotional context
    const supabase = createServerSupabaseClient();
    const emotionalContext = await getEmotionalState(supabase);

    const builder =
      body.contentType === 'carousel' ? buildCarouselPrompt :
      body.contentType === 'story' ? buildStoryPrompt :
      body.contentType === 'caption' ? buildCaptionPrompt :
      buildPostPrompt;

    const prompt = builder(body, emotionalContext);

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
    const saved = await saveGeneratedContent(supabase, {
      content_type: parsed.contentType,
      content_data: parsed.data,
      platform: parsed.platform,
      provider: provider,
      emotional_context: emotionalContext || null,
      metadata: parsed.metadata || {},
      created_at: new Date().toISOString()
    } as any);

    if (!saved) return NextResponse.json({ success: false, error: 'Failed to save content' } as ContentGenerationResponse, { status: 500 });

    return NextResponse.json({ success: true, content: saved, provider } as ContentGenerationResponse);
  } catch (err) {
    console.error('generate-content route error', err);
    return NextResponse.json({ success: false, error: String(err) } as ContentGenerationResponse, { status: 500 });
  }
}
