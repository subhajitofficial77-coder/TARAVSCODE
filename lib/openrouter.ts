import { OpenRouterMessage, OpenRouterRequest, OpenRouterResponse, OpenRouterError } from '@/types/ai';
import { getModelForTask, OPENROUTER_BASE_URL, OPENROUTER_CHAT_ENDPOINT } from '@/lib/config/ai-models';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Request timed out')), timeoutMs))]);
}

export async function callOpenRouter(messages: OpenRouterMessage[], options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set');

  const model = getModelForTask('chat');
  const body: OpenRouterRequest = {
    model: model.id,
    messages,
    temperature: options?.temperature ?? model.temperature,
    max_tokens: options?.maxTokens ?? model.maxTokens,
    stream: false,
  };

  const url = `${OPENROUTER_BASE_URL}${OPENROUTER_CHAT_ENDPOINT}`;

  let lastErr: any = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const t0 = Date.now();
      const res = await withTimeout(fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? '',
        },
        body: JSON.stringify(body),
      }), REQUEST_TIMEOUT_MS);

      const duration = Date.now() - t0;
      if (!res.ok) {
        const errBody = await res.text();
        let parsed: OpenRouterError | null = null;
        try { parsed = JSON.parse(errBody); } catch (e) { /* ignore */ }
        const status = (res as Response).status;
        if (status >= 500 && attempt < MAX_RETRIES - 1) {
          lastErr = new Error(`OpenRouter ${status} ${errBody}`);
          await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
          continue;
        }
        throw new Error(parsed?.error?.message ?? `OpenRouter error: ${errBody}`);
      }

      const data = (await (res as Response).json()) as OpenRouterResponse;
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenRouter');
      console.log(`[OpenRouter] model=${model.id} messages=${messages.length} time=${duration}ms`);
      return content;
    } catch (err: any) {
      lastErr = err;
      const shouldRetry = /timeout|network|ECONNRESET|5\d{2}/i.test(String(err.message));
      if (!shouldRetry) break;
      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
    }
  }

  throw lastErr ?? new Error('OpenRouter request failed');
}

export async function testOpenRouterConnection(): Promise<boolean> {
  try {
    const res = await callOpenRouter([{ role: 'system', content: 'Test connection' }]);
    return Boolean(res && res.length > 0);
  } catch (e) {
    console.warn('OpenRouter health check failed:', e);
    return false;
  }
}
