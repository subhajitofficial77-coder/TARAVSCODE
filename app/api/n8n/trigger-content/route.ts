import { NextResponse } from 'next/server';
import type { ContentGenerationRequest } from '@/types/content';
import { verifyInternalToken } from '@/lib/auth/internal';

const getApiBaseUrl = (request: Request) => {
  // In order of priority:
  // 1. NEXT_PUBLIC_API_URL from env
  // 2. Request origin + /api
  // 3. Fallback to localhost
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    `${new URL(request.url).origin}/api` ||
    'http://localhost:3000/api'
  );
};

export async function POST(request: Request) {
  try {
    // Verify internal token before proceeding
    verifyInternalToken(request);
    const body = await request.json();
    const { seed_id, platform, content_type, seed_label, seed_topic, user_prompt } = body;

    if (!content_type || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields contentType or platform' },
        { status: 400 }
      );
    }

    // Convert to camelCase for generate-content endpoint
    const generationRequest: ContentGenerationRequest = {
      contentType: content_type,
      platform,
      ...(seed_id && { seedId: seed_id }),
      ...(seed_label && { seedLabel: seed_label }),
      ...(seed_topic && { seedTopic: seed_topic }),
      ...(user_prompt && { userPrompt: user_prompt })
    };

    const baseUrl = getApiBaseUrl(request);
    
    // Forward to generate-content endpoint
    const response = await fetch(`${baseUrl}/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generationRequest)
    });

    if (!response.ok) {
      throw new Error('Generate content failed: ' + response.statusText);
    }

    // Return the generated content directly
    const content = await response.json();
    return NextResponse.json(content);
  } catch (error) {
    console.error('Content generation trigger failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger content generation' },
      { status: 500 }
    );
  }
}