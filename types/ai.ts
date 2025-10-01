/**
 * AI integration types for OpenRouter and Google AI fallback
 */
import { EmotionalState } from '@/types/database';

export type AIProvider = 'openrouter' | 'google-ai';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OpenRouterChoice {
  message: OpenRouterMessage;
  finish_reason?: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: OpenRouterChoice[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export interface OpenRouterError {
  error: { message: string; type?: string; code?: string };
}

export interface GoogleAIRequestContentPart { text: string }
export interface GoogleAIRequestContent {
  role: string;
  parts: GoogleAIRequestContentPart[];
}

export interface GoogleAIRequest {
  contents: GoogleAIRequestContent[];
}

export interface GoogleAICandidateContentPart { text: string }
export interface GoogleAICandidateContent {
  parts: GoogleAICandidateContentPart[];
}

export interface GoogleAICandidate {
  content: GoogleAICandidateContent;
  finishReason?: string;
}

export interface GoogleAIResponse {
  candidates: GoogleAICandidate[];
}

export interface GoogleAIError {
  error: { message: string; code?: number; status?: string };
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  provider?: AIProvider;
  emotionalContext?: Partial<EmotionalState>;
  error?: string;
}

export type ChatMessageRole = 'user' | 'tara' | 'system';
