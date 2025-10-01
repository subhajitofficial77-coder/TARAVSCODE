import { GoogleAIRequest, GoogleAIResponse } from '@/types/ai';
import { GOOGLE_AI_CONFIG } from '@/lib/config/ai-models';

const REQUEST_TIMEOUT_MS = 30000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Request timed out')), timeoutMs))]);
}

function convertToGoogleAIFormat(messages: Array<{ role: string; content: string }>): GoogleAIRequest {
  // Merge system message into first user message if present
  const contents: GoogleAIRequest['contents'] = [];
  let systemText = '';
  const others: Array<{ role: string; content: string }> = [];
  for (const m of messages) {
    if (m.role === 'system') systemText += (m.content ?? '') + '\n';
    else others.push(m);
  }

  for (const m of others) {
    const role = m.role === 'assistant' ? 'model' : m.role;
    const text = systemText ? `${systemText}\n${m.content}` : m.content;
    contents.push({ role, parts: [{ text }] });
    systemText = ''; // only merge once
  }

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: systemText || 'Hello' }] });
  }

  return { contents };
}

export async function callGoogleAI(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!process.env.GOOGLE_AI_KEY || !process.env.GOOGLE_AI_ENDPOINT) throw new Error('Google AI key or endpoint not set');
  const url = `${process.env.GOOGLE_AI_ENDPOINT}?key=${process.env.GOOGLE_AI_KEY}`;
  const body = convertToGoogleAIFormat(messages);

  const res = await withTimeout(fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), REQUEST_TIMEOUT_MS);

  if (!(res as Response).ok) {
    const txt = await (res as Response).text();
    throw new Error(`Google AI error: ${txt}`);
  }

  const data = (await (res as Response).json()) as GoogleAIResponse;
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Google AI');
  return text;
}
