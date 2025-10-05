"use client";
import React, { useEffect, useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

export default function ContextDebugPanel({ endpoint = '/api/debug/studio-context' }: { endpoint?: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchContext() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: 'GET' });
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchContext(); }, [endpoint]);

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">Context Debug</h4>
        <div className="flex items-center gap-2">
          <button title="Refresh" onClick={() => void fetchContext()} className="p-2 rounded bg-white/6 hover:bg-white/10">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button title="Copy JSON" onClick={() => { navigator.clipboard.writeText(JSON.stringify(data, null, 2) || ''); }} className="p-2 rounded bg-white/6 hover:bg-white/10">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-white/60">Loading...</div>}
      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      {!loading && !error && (
        <div className="max-h-96 overflow-auto text-xs text-white/80 bg-black/10 p-3 rounded">
          <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
