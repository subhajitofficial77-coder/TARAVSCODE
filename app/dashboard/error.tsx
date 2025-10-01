"use client";
import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error, reset: () => void }) {
  useEffect(() => { console.error('Dashboard error:', error); }, [error]);

  return (
    <main className="min-h-screen bg-tara-bg-dark flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6" role="alert" aria-live="assertive">
        <div className="w-16 h-16 rounded-full bg-red-200/20 border border-red-300/30 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-white/60 text-sm">TARA's consciousness encountered an error</p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <p className="text-xs text-white/70 font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-6 py-3 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/30">Try Again</button>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 rounded-full glass text-white hover:bg-white/15">Go Home</button>
        </div>
      </div>
    </main>
  );
}
