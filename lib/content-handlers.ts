import { ContentSchema, ParsedAIResponse } from '@/types/content';

function tryParseJSON(text: string) {
  // Some LLMs may wrap JSON in markdown or stray text; attempt to find first '{' and last '}'
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  const jsonStr = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error('Failed to parse JSON from AI response');
  }
}

function validateCarousel(obj: any): obj is ContentSchema & { type: 'carousel' } {
  if (obj.type !== 'carousel' || !obj.data) return false;
  if (!Array.isArray(obj.data.slides)) return false;
  return obj.data.slides.every((s: any) => typeof s.title === 'string' && typeof s.body === 'string');
}

function validateStory(obj: any): obj is ContentSchema & { type: 'story' } {
  return obj.type === 'story' && obj.data && typeof obj.data.text === 'string';
}

function validateCaption(obj: any): obj is ContentSchema & { type: 'caption' } {
  return obj.type === 'caption' && obj.data && typeof obj.data.text === 'string';
}

function validatePost(obj: any): obj is ContentSchema & { type: 'post' } {
  return obj.type === 'post' && obj.data && typeof obj.data.text === 'string';
}

function sanitizeText(str: string) {
  return str.replace(/\s+/g, ' ').trim();
}

export function parseAIResponse(raw: string): ParsedAIResponse {
  const parsed: any = tryParseJSON(raw);

  const rawPlatform = (parsed as any).platform || 'instagram';
  const rawMetadata = (parsed as any).metadata || {};

  if (validateCarousel(parsed)) {
    const slides = parsed.data.slides.map((s: any, i: number) => ({
      title: sanitizeText(s.title || `Slide ${i + 1}`),
      body: sanitizeText(s.body || ''),
      imagePrompt: sanitizeText(s.imagePrompt || ''),
      order: Number(s.order ?? i + 1)
    }));
    return { contentType: 'carousel', platform: rawPlatform, data: { slides, hashtags: parsed.data.hashtags || [], caption: sanitizeText(parsed.data.caption || '') }, metadata: rawMetadata } as ParsedAIResponse;
  }

  if (validateStory(parsed)) {
    return { contentType: 'story', platform: rawPlatform, data: { text: sanitizeText(parsed.data.text), callToAction: sanitizeText(parsed.data.callToAction || ''), backgroundColor: parsed.data.backgroundColor || '#000000', textPosition: parsed.data.textPosition || 'center', hashtags: parsed.data.hashtags || [] }, metadata: rawMetadata } as ParsedAIResponse;
  }

  if (validateCaption(parsed)) {
    return { contentType: 'caption', platform: rawPlatform, data: { text: sanitizeText(parsed.data.text), hashtags: parsed.data.hashtags || [], callToAction: sanitizeText(parsed.data.callToAction || '') }, metadata: rawMetadata } as ParsedAIResponse;
  }

  if (validatePost(parsed)) {
    return { contentType: 'post', platform: rawPlatform || 'twitter', data: { text: sanitizeText(parsed.data.text), hashtags: parsed.data.hashtags || [], mentions: parsed.data.mentions || [], imagePrompt: sanitizeText(parsed.data.imagePrompt || '') }, metadata: rawMetadata } as ParsedAIResponse;
  }

  throw new Error('Parsed JSON did not match any known content schema');
}
