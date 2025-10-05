import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AnalysisResult } from '@/types/content';
import { ContentPlatform } from '@/types/database';
import { NextResponse } from 'next/server';

interface SocialMediaAnalysis {
  id: string;
  platform: ContentPlatform;
  content_url: string;
  content_type: string;
  analysis_data: {
    text: string;
    labels: string[];
    objects: string[];
    faces: any[];
    colors: string[];
  };
  sentiment_scores: {
    positive: number;
    negative: number;
    neutral: number;
    compound: number;
    emotions: {
      joy: number;
      sadness: number;
      anger: number;
      fear: number;
      surprise: number;
    };
  };
  visual_elements: any;
  created_at: string;
}

function toAnalysisDto(data: SocialMediaAnalysis): AnalysisResult {
  return {
    platform: data.platform as ContentPlatform,
    contentUrl: data.content_url,
    contentType: data.content_type,
    analysisData: data.analysis_data,
    sentimentScores: data.sentiment_scores,
    visualElements: data.visual_elements,
    createdAt: data.created_at
  };
}

export async function POST(request: Request) {
  try {
    const { contentUrl, platform } = await request.json();
    
    // Validate request parameters
    if (!contentUrl || !platform) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Extract content ID from URL
    const contentId = extractContentId(contentUrl, platform);

    // Check for existing analysis
    const { data: existingAnalysis } = await supabase
      .from('social_media_analysis')
      .select('*')
      .eq('content_url', contentUrl)
      .single();

    if (existingAnalysis) {
      return NextResponse.json(toAnalysisDto(existingAnalysis));
    }

    // Analyze content using Vision AI
    const visionAnalysis = await analyzeWithVisionAI(contentUrl);
    
    // Analyze sentiment and extract themes
    const sentimentAnalysis = await analyzeSentiment(visionAnalysis.text);
    
    // Snake_case for database insert
    const dbAnalysisResult = {
      platform,
      content_url: contentUrl,
      content_type: getContentType(contentUrl),
      analysis_data: visionAnalysis,
      sentiment_scores: sentimentAnalysis,
      visual_elements: extractVisualElements(visionAnalysis),
      created_at: new Date().toISOString()
    };

    // Convert to camelCase for frontend
    const analysisResult: AnalysisResult = {
      platform,
      contentUrl,
      contentType: getContentType(contentUrl),
      analysisData: visionAnalysis,
      sentimentScores: sentimentAnalysis,
      visualElements: extractVisualElements(visionAnalysis),
      createdAt: new Date().toISOString()
    };

    // Store analysis in database
    const { data, error } = await supabase
      .from('social_media_analysis')
      .insert(dbAnalysisResult as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(toAnalysisDto(data as SocialMediaAnalysis));
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: 'Content analysis failed' },
      { status: 500 }
    );
  }
}

// Helper functions
function extractContentId(url: string, platform: ContentPlatform): string {
  // Platform-specific URL parsing logic
  const patterns = {
    'instagram': /instagram\.com\/p\/([\w-]+)/,
    'facebook': /facebook\.com\/[\w.]+\/posts\/(\d+)/,
    'twitter': /twitter\.com\/[\w]+\/status\/(\d+)/,
    'linkedin': /linkedin\.com\/[\w]+\/(\d+)/
  } satisfies Record<ContentPlatform, RegExp>;

  const match = url.match(patterns[platform]);
  return match ? match[1] : '';
}

async function analyzeWithVisionAI(url: string) {
  // Integration with Google Vision AI
  // Implementation depends on specific AI service being used
  return {
    text: '',
    labels: [],
    objects: [],
    faces: [],
    colors: []
  };
}

async function analyzeSentiment(text: string) {
  // Sentiment analysis implementation
  return {
    positive: 0,
    negative: 0,
    neutral: 0,
    compound: 0,
    emotions: {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0
    }
  };
}

function extractVisualElements(visionAnalysis: any) {
  return {
    objects: visionAnalysis.objects,
    colors: visionAnalysis.colors,
    composition: 'balanced', // Analyze image composition
    faces: visionAnalysis.faces.length,
    text: visionAnalysis.text
  };
}

function getContentType(url: string): string {
  // Determine content type based on URL
  if (url.includes('/video/')) return 'video';
  if (url.includes('/reel/')) return 'reel';
  return 'image';
}