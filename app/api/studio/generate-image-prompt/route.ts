import { createServerSupabaseClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/openrouter';
import { AnalysisResult, ImagePrompt } from '@/types/content';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { analysisResult } = await request.json();
    
    if (!analysisResult) {
      return NextResponse.json(
        { error: 'Missing analysis result' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Get current emotional state
    const { data: emotionalState } = await supabase
      .from('emotional_state')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Generate main prompt
    const mainPrompt = await generateMainPrompt(analysisResult, emotionalState);
    
    // Generate negative prompt
    const negativePrompt = generateNegativePrompt(analysisResult);
    
    // Build parameters for Nano Banana
    const parameters = buildNanoBananaParameters(analysisResult, emotionalState);

    const imagePrompt: ImagePrompt = {
      mainPrompt,
      negativePrompt,
      parameters,
      emotionalContext: emotionalState,
      createdAt: new Date().toISOString()
    };

    // Store the prompt
    const { data, error } = await supabase
      .from('generated_prompts')
      .insert({
        prompt_type: 'nano_banana',
        prompt_content: mainPrompt,
        emotional_context: emotionalState,
        creation_parameters: parameters,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ...imagePrompt, id: data.id });
  } catch (error) {
    console.error('Prompt generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate image prompt' },
      { status: 500 }
    );
  }
}

async function generateMainPrompt(
  analysis: AnalysisResult,
  emotionalState: any
): Promise<string> {
  const prompt = `
    Given this visual analysis:
    - Objects: ${analysis.visualElements.objects.join(', ')}
    - Colors: ${analysis.visualElements.colors.join(', ')}
    - Composition: ${analysis.visualElements.composition}
    - Emotional state: ${JSON.stringify(emotionalState)}
    
    Create a detailed, Nano Banana-compatible image generation prompt that:
    1. Captures the key visual elements
    2. Matches TARA's current emotional state
    3. Uses proper Nano Banana syntax and keywords
    4. Specifies composition, lighting, color palette
    5. Includes artistic style and mood descriptors
  `;

  const response = await callOpenRouter(prompt);
  return response.trim();
}

function generateNegativePrompt(analysis: AnalysisResult): string {
  // Generate negative prompt to avoid unwanted elements
  const commonNegatives = [
    'blurry', 'pixelated', 'watermark', 'text',
    'low quality', 'distorted', 'oversaturated'
  ];

  // Add content-specific negatives based on analysis
  const contentNegatives = [];
  
  if (analysis.visualElements.faces > 0) {
    contentNegatives.push('multiple faces', 'distorted faces');
  }

  return [...commonNegatives, ...contentNegatives].join(', ');
}

function buildNanoBananaParameters(
  analysis: AnalysisResult,
  emotionalState: any
): Record<string, any> {
  // Map emotional state to visual parameters
  const moodToParams = {
    joy: { saturation: 1.2, brightness: 1.1 },
    sadness: { saturation: 0.8, brightness: 0.9 },
    anger: { saturation: 1.3, contrast: 1.2 },
    fear: { saturation: 0.7, brightness: 0.8 },
    surprise: { saturation: 1.1, brightness: 1.1 }
  };

  // Get dominant emotion
  const dominantEmotion = Object.entries(emotionalState.emotions)
    .sort(([,a], [,b]) => b - a)[0][0];

  return {
    // Standard parameters
    width: 1024,
    height: 1024,
    steps: 30,
    guidance_scale: 7.5,
    
    // Emotion-based parameters
    ...(moodToParams[dominantEmotion] || {}),
    
    // Analysis-based parameters
    color_balance: analysis.visualElements.colors.slice(0, 3),
    composition_rule: analysis.visualElements.composition
  };
}