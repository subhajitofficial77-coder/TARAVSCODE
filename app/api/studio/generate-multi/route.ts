import { createServerSupabaseClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/openrouter';
import { callGoogleAI } from '@/lib/api/google-ai';
import { getEmotionalState } from '@/lib/supabase/queries';
import { NextResponse } from 'next/server';
import { AnalysisResult, MultiPlatformContent } from '@/types/content';

const PLATFORM_LIMITS = {
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000
};

export async function POST(request: Request) {
  try {
    const { analysisResult, platforms } = await request.json();
    
    if (!analysisResult || !platforms || !platforms.length) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Get current emotional state for context with Supabase client
    const emotionalState = await getEmotionalState(supabase);

    // Generate content for each platform in parallel
    const contentPromises = platforms.map(platform => 
      generatePlatformContent(
        platform,
        analysisResult,
        emotionalState
      )
    );

    const generatedContent = await Promise.all(contentPromises);

    // Store all generated content
    const { data, error } = await supabase
      .from('generated_content')
      .insert(generatedContent)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Multi-platform generation failed:', error);
    return NextResponse.json(
      { error: 'Content generation failed' },
      { status: 500 }
    );
  }
}

async function generatePlatformContent(
  platform: string,
  analysis: AnalysisResult,
  emotionalState: any
): Promise<MultiPlatformContent> {
  const charLimit = PLATFORM_LIMITS[platform];
  
  // Build platform-specific prompt
  const prompt = buildPrompt(platform, analysis, emotionalState, charLimit);
  
  // Generate content using AI
  const content = await callOpenRouter(prompt);
  
  // Generate hashtags
  const hashtags = await generateHashtags(analysis, platform);
  
  return {
    content_type: platform === 'instagram' ? 'carousel' : 'post',
    platform,
    content_data: {
      text: content.trim(),
      hashtags,
      metadata: {
        characterCount: content.length,
        analysisSource: analysis,
        generationModel: 'gpt-4'
      }
    },
    emotional_context: emotionalState,
    user_feedback: null
  } as GeneratedContent;
}

function buildPrompt(
  platform: string,
  analysis: AnalysisResult,
  emotionalState: any,
  charLimit: number
): string {
  const basePrompt = `
    Given this content analysis:
    - Visual elements: ${JSON.stringify(analysis.visualElements)}
    - Sentiment: ${JSON.stringify(analysis.sentimentScores)}
    - Current emotional state: ${JSON.stringify(emotionalState)}
    
    Generate a ${platform} post that:
    - Fits within ${charLimit} characters
    - Matches the platform's tone and style
    - Reflects TARA's current emotional state
    - Incorporates key visual elements
    - Uses appropriate formatting for ${platform}
  `;

  return basePrompt;
}

async function generateHashtags(
  analysis: AnalysisResult,
  platform: string
): Promise<string[]> {
  const prompt = `
    Given these themes and elements:
    ${JSON.stringify(analysis.visualElements)}
    
    Generate 5-10 relevant hashtags for ${platform}
    that will help this content reach its target audience.
  `;

  const response = await callGoogleAI(prompt);
  return response
    .split(' ')
    .filter(tag => tag.startsWith('#'))
    .slice(0, 10);
}