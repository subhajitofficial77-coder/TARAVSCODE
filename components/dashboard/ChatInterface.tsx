"use client";
import React, { forwardRef, useEffect, useRef, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAnnouncer, TARA_ANNOUNCEMENTS } from '@/lib/accessibility/announcer';

type ChatMessage = { id?: string; role: 'user' | 'tara' | 'system'; message: string; created_at?: string };

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onMessageSent?: () => void;
}

const ChatInterface = forwardRef<HTMLInputElement, ChatInterfaceProps>(function ChatInterface({ chatHistory, onMessageSent }, ref) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const internalInputRef = useRef<HTMLInputElement | null>(null);
  // prefer forwarded ref, otherwise use internal
  const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalInputRef;

  const { announce } = useAnnouncer();

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const allMessages = useMemo(() => [...(chatHistory ?? []), ...localMessages], [chatHistory, localMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  async function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', message: trimmed, created_at: new Date().toISOString() };
    setLocalMessages((s) => [...s, userMsg]);
    setInputMessage('');
    setIsSending(true);

    // track the tara placeholder id so we can remove it on error
    let taraId: string | null = null;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        // try to parse error JSON
        try {
          const errJson = await res.json();
          throw new Error(errJson?.error || 'Failed to send message');
        } catch (e) {
          throw new Error('Failed to send message');
        }
      }

      // We expect text/event-stream or a streaming body. Read it incrementally.
      const reader = (res.body as ReadableStream<Uint8Array>).getReader();
      const decoder = new TextDecoder();

      // Insert an empty TARA message as a placeholder and update its content incrementally
      taraId = (Date.now() + 1).toString();
      setLocalMessages((s) => [...s, { id: taraId!, role: 'tara', message: '', created_at: new Date().toISOString() }] );

      let done = false;
      let buffer = '';
      let taraText = '';
      while (!done) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Split by newline and process full lines. Keep partial in buffer.
          const parts = buffer.split(/\r?\n/);
          buffer = parts.pop() ?? '';

          for (const rawLine of parts) {
            if (!rawLine) continue;
            // Expect SSE-style: data: {...}
            const match = rawLine.match(/^data:\s?(.*)$/);
            if (!match) continue;
            const payload = match[1];

            if (payload === '[DONE]') {
              // Finalize: persist final message and break
              try {
                await fetch('/api/chat/history', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: taraText, created_at: new Date().toISOString() }),
                });
              } catch (e) {
                console.warn('Failed to persist final streamed message', e);
              }
              done = true;
              break;
            }

            // Parse JSON payload
            try {
              const parsed = JSON.parse(payload);
              // OpenRouter delta-style: choices[0].delta.content or choices[0].message.content
              const delta = parsed?.choices?.[0]?.delta;
              const content = delta?.content ?? parsed?.choices?.[0]?.message?.content;
              if (content && typeof content === 'string') {
                taraText += content;
                setLocalMessages((msgs) => msgs.map((m) => (m.id === taraId ? { ...m, message: taraText } : m)));
                continue;
              }

              // Google fallback single-event shape: { success: true, message: '...' }
              if (parsed?.success === true && typeof parsed?.message === 'string') {
                taraText += parsed.message;
                setLocalMessages((msgs) => msgs.map((m) => (m.id === taraId ? { ...m, message: taraText } : m)));
                // Persist final fallback response
                try {
                  await fetch('/api/chat/history', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: taraText, created_at: new Date().toISOString() }),
                  });
                } catch (e) {
                  console.warn('Failed to persist fallback message', e);
                }
                done = true;
                break;
              }
            } catch (e) {
              // malformed JSON -> ignore
            }
          }
        }
      }

      announce?.(TARA_ANNOUNCEMENTS.chatResponse());
      toast.success('TARA responded');
      onMessageSent?.();
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message. Please try again.');
      // remove optimistic user message
      setLocalMessages((s) => s.filter((m) => m.id !== userMsg.id));
      // remove tara placeholder if inserted
      if (taraId) {
        setLocalMessages((s) => s.filter((m) => m.id !== taraId));
      }
      // announce error to screen readers
      try {
        announce?.(TARA_ANNOUNCEMENTS.error((err as Error)?.message ?? 'Failed to send message'));
      } catch (_) {}
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6 mt-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Conversation with TARA</h2>
        <p className="text-xs text-white/50">{isSending ? 'Sending...' : 'Connected'}</p>
      </div>

      <div
        className="h-96 overflow-y-auto p-2 space-y-4 bg-transparent"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {(!allMessages || allMessages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 mb-4" />
            <p className="text-white/70">No conversation history yet</p>
            <p className="text-sm text-white/40 mt-2">No messages yet. Start a conversation with TARA!</p>
          </div>
        )}

        {allMessages && allMessages.map((m, i) => (
          <div key={m.id ?? i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'user' ? (
              <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[70%]">
                <p className="text-white text-sm">{m.message}</p>
                <time className="text-xs text-white/40 mt-1 block" dateTime={m.created_at ?? undefined}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</time>
              </div>
            ) : (
              <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-[70%]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-green-400" />
                  <p className="text-xs text-white/60 uppercase tracking-wide">TARA</p>
                </div>
                <p className="text-white text-sm">{m.message}</p>
                <time className="text-xs text-white/40 mt-1 block" dateTime={m.created_at ?? undefined}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</time>
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 max-w-[50%]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-green-400" />
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-3 mt-4">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            aria-label="Chat message input"
            placeholder="Message TARA..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
            className="w-full glass rounded-full px-6 py-3 text-white placeholder:text-white/40 focus:outline-none"
          />
          <p className="sr-only">Press Ctrl+K to focus the chat input</p>
          <p className="text-xs text-white/40 mt-2">Tip: press Ctrl+K to focus</p>
        </div>

        <button aria-label="Send message" type="submit" disabled={isSending || !inputMessage.trim()} className="px-6 py-3 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
});

export default ChatInterface;
