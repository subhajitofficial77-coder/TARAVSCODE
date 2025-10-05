import { ContentGenerationRequest } from '@/types/content';
import type { EmotionalState } from '@/types/database';
import type { WeatherReport } from '@/lib/api/weather';

interface SeedContext {
  seedId?: string;
  seedLabel?: string;
  seedTopic?: string;
}

interface RefinementContext {
  parentId?: string;
  refinementNotes?: string;
  parentContent?: any;
  parentEmotions?: any;
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram:
    'Instagram guidelines: 1-2 short paragraphs, emojis allowed, hashtags at the end, keep captions punchy and visual. For carousel slides, keep text short (max 60 chars) and call-to-action on final slide.',
  twitter:
    'Twitter/X guidelines: short, snappy sentences; aim for 1-3 lines; include 1-3 hashtags; avoid long paragraphs. If platform allows threads, break content into numbered tweets.',
  linkedin:
    'LinkedIn guidelines: professional tone, 2-4 short paragraphs with an insightful hook, include relevant hashtags (1-3), and a clear call-to-action. Avoid emojis except sparingly.'
};

function toneMappingDescription() {
  return `Tone mapping rules: map emotions to tone as follows — joy: upbeat/optimistic; trust: warm/reassuring; anticipation: motivational/forward-looking; sadness: reflective/empathetic; fear: calming/soothing; anger: firm/direct; disgust: avoid negative descriptors. Use these as guidance when choosing words, CTAs, and imagery.`;
}

// Few-shot examples for carousel generation mapping emotion -> sample slide text
const FEW_SHOT_EXAMPLES = `Examples:\n
Example 1 (dominant: joy):\n{
  "type": "carousel",
  "data": { "slides": [
    { "title": "Celebrate Small Wins", "body": "Each small step is progress — celebrate it!", "order": 1, "tone": "upbeat" },
    { "title": "Keep Going", "body": "Momentum builds with tiny daily habits.", "order": 2, "tone": "upbeat" }
  ] }
}\n
Example 2 (dominant: sadness):\n{
  "type": "carousel",
  "data": { "slides": [
    { "title": "It's Okay to Pause", "body": "Gentle reminders for slow days — rest is part of progress.", "order": 1, "tone": "reflective" },
    { "title": "Reach Out", "body": "A short message to someone who cares can help.", "order": 2, "tone": "empathetic" }
  ] }
}`;

function baseInstruction(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null, dailyPlan?: string[] | null, weather?: WeatherReport | null, lastEvent?: string | null, seedContext?: SeedContext | null, refinementContext?: RefinementContext | null) {
  const platformGuideline = PLATFORM_GUIDELINES[request.platform] || '';
  const theme = request.theme ? `Theme: ${request.theme}.` : '';
  const userPrompt = request.userPrompt ? `User prompt: ${request.userPrompt}` : '';
  const emotionSummary = emotionalContext ? `Current emotional context: ${JSON.stringify({ primary_emotions: emotionalContext.primary_emotions, mood: emotionalContext.mood })}` : '';
  const planSummary = dailyPlan && dailyPlan.length > 0 ? `Daily plan topics: ${dailyPlan.slice(0,5).join(', ')}.` : '';
  const weatherSummary = weather ? `Weather: ${weather.condition || ''} ${weather.temp_c ? `${weather.temp_c}°C` : ''}` : '';
  const seedSummary = seedContext?.seedLabel ? `Creative task from TARA's Master Plan: "${seedContext.seedLabel}" (Topic: ${seedContext.seedTopic || 'general'})` : '';
  const refinementSummary = refinementContext?.refinementNotes ? `Refinement requested: "${refinementContext.refinementNotes}". Original content preview: ${JSON.stringify(refinementContext.parentContent || {}).substring(0,200)}...` : '';

  // We explicitly require the model to include a metadata.used_context object describing which inputs it used
  const usageReq = `IMPORTANT: In the JSON response include a top-level \"metadata\" object with a \"used_context\" field describing which context fields were actually used and why (e.g. { emotional_context: 'dominant: joy', daily_plan: ['topic1'], weather: 'clear' }). Also include a short \"tone\" string for each slide, and map the dominant emotion to that tone according to the tone mapping rules below.`;

  return `${["You are a social media content assistant. Generate", `${request.contentType} content for ${request.platform}.`, platformGuideline, theme, userPrompt, emotionSummary, planSummary, weatherSummary, seedSummary, refinementSummary, usageReq, toneMappingDescription(), seedContext ? "This content is part of TARA's daily creative plan and should align with her current emotional state and the specific task described above." : ''].filter(Boolean).join(' ')}`.trim();
}

export function buildCarouselPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null, dailyPlan?: string[] | null, weather?: WeatherReport | null, lastEvent?: string | null, seedContext?: SeedContext | null, refinementContext?: RefinementContext | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext, dailyPlan, weather, lastEvent, seedContext, refinementContext)}\n\nOutput schema:\n{\n  \"type\": \"carousel\",\n  \"data\": {\n    \"slides\": [\n      { \"title\": \"string\", \"body\": \"string\", \"imagePrompt\": \"string\", \"order\": \"number\" }\n    ],\n    \"hashtags\": [\"string\"],\n    \"caption\": \"string\"\n  }\n}\n\nRespond only with valid JSON that matches the schema. Do not add commentary.`,
    maxTokens: 1200
  };
}

export function buildStoryPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null, dailyPlan?: string[] | null, weather?: WeatherReport | null, lastEvent?: string | null, seedContext?: SeedContext | null, refinementContext?: RefinementContext | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext, dailyPlan, weather, lastEvent, seedContext, refinementContext)}\n\nOutput schema:\n{\n  \"type\": \"story\",\n  \"data\": {\n    \"text\": \"string\",\n    \"callToAction\": \"string?\",\n    \"backgroundColor\": \"hex\",\n    \"textPosition\": \"top|center|bottom\",\n    \"hashtags\": [\"string\"]\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 800
  };
}

export function buildCaptionPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null, dailyPlan?: string[] | null, weather?: WeatherReport | null, lastEvent?: string | null, seedContext?: SeedContext | null, refinementContext?: RefinementContext | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext, dailyPlan, weather, lastEvent, seedContext, refinementContext)}\n\nOutput schema:\n{\n  \"type\": \"caption\",\n  \"data\": {\n    \"text\": \"string\",\n    \"hashtags\": [\"string\"],\n    \"callToAction\": \"string?\"\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 600
  };
}

export function buildPostPrompt(request: ContentGenerationRequest, emotionalContext?: EmotionalState | null, dailyPlan?: string[] | null, weather?: WeatherReport | null, lastEvent?: string | null, seedContext?: SeedContext | null, refinementContext?: RefinementContext | null) {
  return {
    prompt: `${baseInstruction(request, emotionalContext, dailyPlan, weather, lastEvent, seedContext, refinementContext)}\n\nOutput schema:\n{\n  \"type\": \"post\",\n  \"data\": {\n    \"text\": \"string\",\n    \"hashtags\": [\"string\"],\n    \"mentions\": [\"string\"],\n    \"imagePrompt\": \"string?\"\n  }\n}\n\nRespond only with valid JSON that matches the schema.`,
    maxTokens: 1000
  };
}

export { PLATFORM_GUIDELINES };
