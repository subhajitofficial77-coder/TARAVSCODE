import type { ContentType, ContentData, GeneratedContent, ContentPlatform } from './database';

export interface BaseGenerationProps {
  contentType: ContentType;
  platform: ContentPlatform;
  seedId?: string;
  seedLabel?: string;
  seedTopic?: string;
  userPrompt?: string;
}

export interface ContentGenerationRequest extends BaseGenerationProps {
  theme?: string;
  // Seed-driven generation (required fields)
  seedId: string;
  seedLabel: string;
  seedTopic: string;
  // Refinement/regeneration (optional)
  parentId?: string;
  refinementNotes?: string;
  // Analysis-driven generation (optional)
  analysisResult?: AnalysisResult;
}

// Use ContentData from database.ts instead of declaring it here

/** Analysis result from social media content */
export interface AnalysisResult {
    id?: string;
    platform: ContentPlatform;
    contentUrl: string;
    contentType: string;
    analysisData: {
        text: string;
        labels: string[];
        objects: string[];
        faces: any[];
        colors: string[];
    };
    sentimentScores: {
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
    visualElements: {
        objects: string[];
        colors: string[];
        composition: string;
        faces: number;
        text: string;
    };
    createdAt: string;
}

/** Stored memory of content analysis and generation */
export interface ContentMemory {
    id: string;
    content_type: ContentType;
    platform: ContentPlatform;
    original_content: {
        url: string;
        type: string;
        data: any;
    };
    analysis_result: AnalysisResult;
    generated_content: {
        text: string;
        hashtags: string[];
        variations: string[];
    };
    emotional_state: {
        primary_emotions: Record<string, number>;
        mood: {
            optimism: number;
            energy_level: number;
            stress_level: number;
        };
    };
    weather_context: {
        temperature: number;
        condition: string;
        location: string;
    };
    user_feedback: 'accepted' | 'rejected' | 'declined';
    feedback_notes?: string;
    created_at: string;
    updated_at: string;
}

/** Image generation prompt for Nano Banana */
export interface ImagePrompt {
    id?: string;
    mainPrompt: string;
    negativePrompt: string;
    parameters: {
        width: number;
        height: number;
        steps: number;
        guidance_scale: number;
        saturation?: number;
        brightness?: number;
        contrast?: number;
        color_balance?: string[];
        composition_rule?: string;
    };
    emotionalContext: {
        primary_emotions: Record<string, number>;
        mood: {
            optimism: number;
            energy_level: number;
        };
    };
    createdAt: string;
}

/** Request payload for content generation */
// ContentGenerationRequest interface is already defined above

/** Multi-platform generated content */
export interface MultiPlatformContent {
    platform: ContentPlatform;
    content: string;
    hashtags: string[];
    characterCount: number;
    emotionalFingerprint: {
        primary_emotions: Record<string, number>;
        mood: {
            optimism: number;
            energy_level: number;
        };
    };
}

/** Carousel slide structure */
export interface CarouselSlide {
  title: string;
  body: string;
  imagePrompt: string;
  order: number;
}

/** Story content structure */
export interface StoryContent {
  text: string;
  callToAction?: string;
  backgroundColor: string; // hex
  textPosition: 'top' | 'center' | 'bottom';
  hashtags?: string[];
}

/** Caption content structure */
export interface CaptionContent {
  text: string;
  hashtags?: string[];
  callToAction?: string;
}

/** Post content structure */
export interface PostContent {
  text: string;
  hashtags?: string[];
  mentions?: string[];
  imagePrompt?: string;
}

/** Content schema mapping */
export type ContentSchema =
  | { type: 'carousel'; data: { slides: CarouselSlide[]; hashtags: string[]; caption: string } }
  | { type: 'story'; data: StoryContent }
  | { type: 'caption'; data: CaptionContent }
  | { type: 'post'; data: PostContent };

/** Response from content generation API */
export interface ContentGenerationResponse {
  success: boolean;
  content?: GeneratedContent;
  error?: string;
  provider?: 'openrouter' | 'google-ai';
}

/** Parsed AI response */
export interface ParsedAIResponse {
  contentType: ContentType;
  platform: string;
  data: any;
  metadata?: Record<string, any>;
}

/** Emotional color system */
export interface EmotionalColors {
    joy: {
        primary: string;
        secondary: string;
        accent: string;
    };
    trust: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fear: {
        primary: string;
        secondary: string;
        accent: string;
    };
    surprise: {
        primary: string;
        secondary: string;
        accent: string;
    };
    sadness: {
        primary: string;
        secondary: string;
        accent: string;
    };
    disgust: {
        primary: string;
        secondary: string;
        accent: string;
    };
    anger: {
        primary: string;
        secondary: string;
        accent: string;
    };
    anticipation: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

// Re-export not needed as we're importing types directly
