/**
 * AI model configuration for OpenRouter and Google AI (Phase 5)
 */

export interface ModelConfig {
  id: string;
  name: string;
  maxTokens: number;
  temperature: number;
}

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
export const OPENROUTER_CHAT_ENDPOINT = '/chat/completions';

export const OPENROUTER_MODELS: Record<'chat' | 'creative', ModelConfig> = {
  chat: {
    id: 'openai/gpt-3.5-turbo',
    name: 'gpt-3.5-turbo (fast)',
    maxTokens: 512,
    temperature: 0.7,
  },
  creative: {
    id: 'openai/gpt-4o',
    name: 'gpt-4o (creative)',
    maxTokens: 2048,
    temperature: 0.9,
  },
};

export const GOOGLE_AI_CONFIG = {
  model: 'gemini-2.0-flash',
  endpoint: process.env.GOOGLE_AI_ENDPOINT || '',
  maxTokens: 2048,
  temperature: 0.7,
};

export function getModelForTask(task: 'chat' | 'creative'): ModelConfig {
  return OPENROUTER_MODELS[task];
}

/**
 * JSDoc: For Phase 5 we use the 'chat' model by default. Creative models are reserved for
 * content generation in later phases.
 */
