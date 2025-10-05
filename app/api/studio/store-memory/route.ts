import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEmotionalState } from '@/lib/supabase/queries';
import { fetchCurrentWeather } from '@/lib/api/weather';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const memory = await request.json();
    
    if (!memory || !memory.content_type || !memory.platform) {
      return NextResponse.json(
        { error: 'Missing required memory fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Check for duplicates
    const { data: existing } = await supabase
      .from('content_memories')
      .select('id')
      .eq('original_content->url', memory.original_content?.url)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Memory already exists', id: existing.id },
        { status: 409 }
      );
    }

    // Get current context
    const [emotionalState, weather] = await Promise.all([
      getEmotionalState(),
      fetchCurrentWeather()
    ]);

    // Prepare memory with context
    const completeMemory = {
      ...memory,
      emotional_state: emotionalState,
      weather_context: weather,
      created_at: new Date().toISOString()
    };

    // Store in database
    const { data, error } = await supabase
      .from('content_memories')
      .insert(completeMemory)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      memory: data
    });
  } catch (error) {
    console.error('Memory storage failed:', error);
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const contentType = searchParams.get('content_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerSupabaseClient();
    
    // Build query
    let query = supabase
      .from('content_memories')
      .select(`
        *,
        generated_prompts (*)
      `);

    // Apply filters
    if (platform) query = query.eq('platform', platform);
    if (contentType) query = query.eq('content_type', contentType);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    // Add pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('content_memories')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      memories: data,
      pagination: {
        total: totalCount,
        offset,
        limit,
        hasMore: totalCount > offset + limit
      }
    });
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve memories' },
      { status: 500 }
    );
  }
}