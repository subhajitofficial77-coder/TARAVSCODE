import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ContentMemory } from '@/types/content';
import { ContentType, ContentPlatform } from '@/types/database';
import { NextRequest, NextResponse } from 'next/server';

interface FetchMemoriesParams {
  platform?: ContentPlatform;
  contentType?: ContentType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MemoryResponse {
  memories: ContentMemory[];
  pagination: PaginationMetadata;
}

interface FetchMemoriesParams {
  platform?: ContentPlatform;
  contentType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const params: FetchMemoriesParams = {
      platform: (searchParams.get('platform') as ContentPlatform) || undefined,
      contentType: (searchParams.get('contentType') as ContentType) || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || 10))
    };

    const supabase = createServerSupabaseClient();

    // Start query builder
    let query = supabase
      .from('content_memories')
      .select('*', { count: 'exact' });

    // Apply filters
    if (params.platform) {
      query = query.eq('platform', params.platform);
    }
    if (params.contentType) {
      query = query.eq('content_type', params.contentType);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    // Add pagination
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Transform snake_case to camelCase for frontend
    const memories = data?.map(memory => ({
      id: memory.id,
      contentType: memory.content_type,
      platform: memory.platform,
      originalContent: memory.original_content,
      analysisResult: memory.analysis_result,
      generatedContent: memory.generated_content,
      emotionalState: memory.emotional_state,
      weatherContext: memory.weather_context,
      userFeedback: memory.user_feedback,
      feedbackNotes: memory.feedback_notes,
      createdAt: memory.created_at,
      updatedAt: memory.updated_at
    }));

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / params.pageSize);

    const response: MemoryResponse = {
      memories: memories as ContentMemory[],
      pagination: {
        currentPage: params.page,
        pageSize: params.pageSize,
        totalCount,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch memories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}