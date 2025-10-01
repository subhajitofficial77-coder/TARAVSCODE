import type { ContentType, ContentData, GeneratedContent } from '@/types/database';

/** Request payload for content generation */
export interface ContentGenerationRequest {
  contentType: ContentType; // 'carousel' | 'story' | 'caption' | 'post'
  platform: 'instagram' | 'twitter' | 'linkedin';
  userPrompt?: string;
  theme?: string;
}

/** Response from content generation API */
export interface ContentGenerationResponse {
  success: boolean;
  content?: GeneratedContent;
  error?: string;
  provider?: 'openrouter' | 'google-ai';
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

/** Parsed AI response */
export interface ParsedAIResponse {
  contentType: ContentType;
  platform: string;
  data: any;
  metadata?: Record<string, any>;
}

export { ContentType, ContentData, GeneratedContent };
