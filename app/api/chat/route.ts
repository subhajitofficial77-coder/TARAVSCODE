import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { getGenesisPrompt } from '@/lib/prompts/genesis-v7';
// callOpenRouter not used here because streaming is proxied directly to OpenRouter via fetch
import { callGoogleAI } from '@/lib/api/google-ai';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { saveChatMessage, getEmotionalState } from '@/lib/supabase/queries';
import type { ChatRequest, ChatResponse } from '@/types/ai';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequest;
    if (!body?.message || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' } as ChatResponse, { status: 400 });
    }

  const supabase = createServerSupabaseClient();

    // Save user message (best-effort)
    try {
      await saveChatMessage(supabase, { role: 'user', message: body.message.trim() });
    } catch (e) {
      console.warn('Failed to save user message:', e);
    }

    // Build prompt with injected emotional state
    let genesisPrompt: string;
    try {
      genesisPrompt = await getGenesisPrompt();
    } catch (e) {
      console.error('Failed to build genesis prompt:', e);
      return NextResponse.json({ success: false, error: "Failed to initialize TARA's consciousness" } as ChatResponse, { status: 500 });
    }

    const messages = [
      { role: 'system', content: genesisPrompt },
      { role: 'user', content: body.message.trim() },
    ];

    // For streaming, prefer OpenRouter streaming API. We'll attempt to open a streaming connection
    // and proxy the stream directly to the client. If streaming fails, fall back to non-streaming Google AI.

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openUrl = `${process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1'}${process.env.OPENROUTER_CHAT_ENDPOINT ?? '/chat/completions'}`;

    // Helper to create a streamed response from OpenRouter
    try {
      if (!openrouterKey) throw new Error('OpenRouter key not configured');

      const model = (await import('@/lib/config/ai-models')).getModelForTask('chat');
      const body = {
        model: model.id,
        messages,
        temperature: model.temperature,
        max_tokens: model.maxTokens,
        stream: true,
      };

      const upstream = await fetch(openUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openrouterKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!upstream.ok || !upstream.body) {
        const txt = await upstream.text().catch(() => '[no body]');
        throw new Error(`OpenRouter streaming failed: ${upstream.status} ${txt}`);
      }

      // Pipe the upstream ReadableStream directly back to the client
      const stream = upstream.body;
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } catch (streamErr) {
      console.warn('OpenRouter streaming failed, falling back to Google AI:', streamErr);
      // fallback: call Google AI non-streaming
      try {
        const taraResponse = await callGoogleAI(messages as any);

        // Save TARA's message with emotional state snapshot
        try {
          const currentState = await getEmotionalState(supabase);
          await saveChatMessage(supabase, { role: 'tara', content: taraResponse, message: taraResponse, emotional_context: currentState ? { primary_emotions: currentState.primary_emotions, mood: currentState.mood } : undefined });
        } catch (e) {
          console.warn('Failed to save tara message:', e);
        }

        // Return an SSE-like single event for clients to consume
        const encoder = new TextEncoder();
        const payload = `data: ${JSON.stringify({ success: true, message: taraResponse, provider: 'google-ai' })}\n\n`;
        return new Response(encoder.encode(payload), { headers: { 'Content-Type': 'text/event-stream' } });
      } catch (bothErr) {
        console.error('Both AI providers failed', bothErr);
        return NextResponse.json({ success: false, error: 'TARA is temporarily unavailable. Please try again.' } as ChatResponse, { status: 503 });
      }
    }
  } catch (err) {
    console.error('Chat route unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' } as ChatResponse, { status: 500 });
  }
}
