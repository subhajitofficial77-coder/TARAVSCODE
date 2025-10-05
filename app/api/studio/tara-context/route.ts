import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { fetchCurrentWeather } from '@/lib/api/weather';
import { getEmotionalSummary } from '@/lib/tale-engine';
import { getContextCache, setContextCache, clearContextCache, cacheAgeMs } from '@/lib/studio/contextCache';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const verifyInternalToken = (request: Request) => {
  const token = request.headers.get('X-Internal-Token');
  // Also allow token via query param for development/browser requests
  let urlToken: string | null = null;
  try {
    // Next.js Route handlers expose nextUrl; prefer that to avoid relative URL parsing issues
    // @ts-ignore
    if (request?.nextUrl && request.nextUrl.searchParams) {
      // @ts-ignore
      urlToken = request.nextUrl.searchParams.get('token');
    } else {
      // fallback to parsing with a base so relative paths don't throw
      const url = new URL(request.url, 'http://localhost');
      urlToken = url.searchParams.get('token');
    }
  } catch (e) {
    // ignore
  }
  const validToken = process.env.INTERNAL_API_TOKEN;

  if (!validToken) {
    throw new Error('INTERNAL_API_TOKEN not configured');
  }

  // In development allow bypass for convenience (but log a warning)
  if (process.env.NODE_ENV !== 'production') {
    if (token === validToken || urlToken === validToken) return;
    console.warn('Development mode: tara-context request without valid internal token; falling through to cached context if available');
    return;
  }

  if (!(token === validToken || urlToken === validToken)) {
    throw new Error('Invalid or missing X-Internal-Token');
  }
};

export async function GET(request: Request) {
  try {
    // Verify internal token before proceeding
    verifyInternalToken(request);

    // Check cache
    const existing = getContextCache();
    const age = cacheAgeMs();
    if (existing && age !== null && age < CACHE_DURATION) {
      return NextResponse.json(existing);
    }

    const supabase = createServiceRoleClient();
    const warnings: string[] = [];
    const context: Record<string, any> = {};
    
    // 1. Get emotional state
    try {
      const { data: emotionalState, error: esError } = await supabase
        .from('emotional_state')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (esError) throw esError;
      context.emotional_state = emotionalState;
    } catch (error) {
      console.error('Failed to fetch emotional state:', error);
      warnings.push('Could not fetch current emotional state');
    }

    // 2. Get core traits if available
    try {
      const { data: traits, error: traitsError } = await supabase
        .from('core_traits')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (!traitsError && traits) {
        context.core_traits = traits;
      }
    } catch (error) {
      console.error('Failed to fetch core traits:', error);
      warnings.push('Could not fetch core traits');
    }

    // 3. Get active relationships
    try {
      const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('*')
        .eq('status', 'active');

      if (relError) throw relError;
      context.relationships = relationships || [];
    } catch (error) {
      console.error('Failed to fetch relationships:', error);
      warnings.push('Could not fetch active relationships');
      context.relationships = [];
    }

    // 4. Get daily plans
    try {
      const { data: plans, error: plansError } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('completed', false)
        .order('priority', { ascending: true });

      if (plansError) throw plansError;
      context.daily_plans = plans || [];
    } catch (error) {
      console.error('Failed to fetch daily plans:', error);
      warnings.push('Could not fetch daily plans');
      context.daily_plans = [];
    }

    // 5. Get weather data
    try {
      const weather = await fetchCurrentWeather();
      context.weather = weather;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      warnings.push('Could not fetch current weather');
    }

    // 6. Generate emotional summary if state exists
    if (context.emotional_state) {
      try {
        context.emotional_summary = await getEmotionalSummary(context.emotional_state);
      } catch (error) {
        console.error('Failed to generate emotional summary:', error);
        warnings.push('Could not generate emotional summary');
      }
    }

  // Cache successful response
  const response = { context, warnings: warnings.length > 0 ? warnings : undefined };
  setContextCache(response);

  return NextResponse.json(response);
  } catch (error) {
    console.error('Error retrieving TARA context:', error);
    const cached = getContextCache();
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to retrieve TARA context',
        success: false,
        timestamp: new Date().toISOString(),
        context: cached?.context || null
      },
      { 
        status: error instanceof Error && error.message.includes('X-Internal-Token') ? 401 : 500 
      }
    );
  }
}
