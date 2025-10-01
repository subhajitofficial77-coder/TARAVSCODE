import React, { useState } from 'react';
import type { ContentGenerationRequest, ParsedAIResponse } from '@/types/content';

export default function ContentGenerationPanel({ onContentGenerated }: { onContentGenerated?: (item: any) => void }) {
  const [contentType, setContentType] = useState<'carousel' | 'story' | 'caption' | 'post'>('carousel');
  const [platform, setPlatform] = useState<'instagram' | 'twitter' | 'linkedin'>('instagram');
  const [theme, setTheme] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentType, platform, theme, userPrompt: prompt } as ContentGenerationRequest) });
      const data = await res.json();
      if (data?.success && data.content) {
        onContentGenerated?.(data.content as any);
      } else {
        alert('Generation failed: ' + (data?.error || 'unknown'));
      }
    } catch (err) {
      console.error('generate error', err);
      alert('Generate request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded p-4 bg-white shadow-sm">
      <div className="flex gap-2">
        <select value={contentType} onChange={(e) => setContentType(e.target.value as any)} className="border p-1 rounded">
          <option value="carousel">Carousel</option>
          <option value="story">Story</option>
          <option value="caption">Caption</option>
          <option value="post">Post</option>
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value as any)} className="border p-1 rounded">
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
        </select>
        <input className="flex-1 border p-1 rounded" placeholder="theme (optional)" value={theme} onChange={(e) => setTheme(e.target.value)} />
      </div>
      <textarea className="w-full h-24 mt-3 p-2 border rounded" placeholder="Optional instruction or user prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <div className="flex justify-end mt-2">
        <button onClick={generate} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">{loading ? 'Generating...' : 'Generate'}</button>
      </div>
    </div>
  );
}
