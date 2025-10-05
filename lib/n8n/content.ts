import type { InspirationSeed, GeneratedContent, ContentType, ContentPlatform } from '@/types/database';

export interface ContentGenerationOptions {
  platforms: ContentPlatform[];
  formats: ContentType[];
}

export async function generateSocialContent(
  seed: InspirationSeed,
  options: ContentGenerationOptions,
  context: any
): Promise<GeneratedContent> {
  const response = await fetch('/api/n8n/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seed_id: seed.id,
      platforms: options.platforms,
      formats: options.formats,
      context
    })
  });

  if (!response.ok) {
    throw new Error(`Content generation failed: ${response.status} ${response.statusText}`);
  }

  const { content } = await response.json();
  return content;
}

export async function publishContent(
  content: GeneratedContent,
  platforms: ContentPlatform[]
) {
  const response = await fetch('/api/n8n/publish-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content_id: content.id,
      platforms
    })
  });

  if (!response.ok) {
    throw new Error(`Content publishing failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}