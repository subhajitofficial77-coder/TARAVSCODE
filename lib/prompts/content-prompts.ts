import { ContentGenerationRequest } from '@/types/content';
import type { EmotionalState } from '@/types/database';

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram:
    'Instagram guidelines: 1-2 short paragraphs, emojis allowed, hashtags at the end, keep captions punchy and visual. For carousel slides, keep text short (max 60 chars) and call-to-action on final slide.',
  twitter:
    'Twitter/X guidelines: short, snappy sentences; aim for 1-3 lines; include 1-3 hashtags; avoid long paragraphs. If platform allows threads, break content into numbered tweets.',
  linkedin:
    'LinkedIn guidelines: professional tone, 2-4 short paragraphs with an insightful hook, include relevant hashtags (1-3), and a clear call-to-action. Avoid emojis except sparingly.'
};

function baseInstruction(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null) {
  const platformGuideline = PLATFORM_GUIDELINES[request.platform] || '';
  const theme = request.theme ? `Theme: ${request.theme}.` : '';
  const userPrompt = request.userPrompt ? `User prompt: ${request.userPrompt}` : '';
  const emotionSummary = emotionalContext ? `Current emotional context: ${JSON.stringify({ primary_emotions: emotionalContext.primary_emotions, mood: emotionalContext.mood })}` : '';

  return `You are a social media content assistant. Generate ${request.contentType} content for ${request.platform}. ${platformGuideline} ${theme} ${userPrompt} ${emotionSummary} Provide structured JSON only following the schema described.`.trim();
}

export function buildCarouselPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext)}\n\nOutput schema:\n{
  \"type\": \"carousel\",
  \"data\": {
    \"slides\": [
      { \"title\": \"string\", \"body\": \"string\", \"imagePrompt\": \"string\", \"order\": \"number\" }
    ],
    \"hashtags\": [\"string\"],
    \"caption\": \"string\"
  }
}\n\nRespond only with valid JSON that matches the schema. Do not add commentary.`,
    maxTokens: 1200
  };
}

export function buildStoryPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext)}\n\nOutput schema:\n{\n  \"type\": \"story\",\n  \"data\": {\n    \"text\": \"string\",\n    \"callToAction\": \"string?\",\n    \"backgroundColor\": \"hex\",\n    \"textPosition\": \"top|center|bottom\",\n    \"hashtags\": [\"string\"]\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 800
  };
}

export function buildCaptionPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext)}\n\nOutput schema:\n{\n  \"type\": \"caption\",\n  \"data\": {\n    \"text\": \"string\",\n    \"hashtags\": [\"string\"],\n    \"callToAction\": \"string?\"\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 600
  };
}

export function buildPostPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext)}\n\nOutput schema:\n{\n  \"type\": \"post\",\n  \"data\": {\n    \"text\": \"string\",\n    \"hashtags\": [\"string\"],\n    \"mentions\": [\"string\"],\n    \"imagePrompt\": \"string?\"\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 1000
  };
}

export { PLATFORM_GUIDELINES };
