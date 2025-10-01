import React from 'react';
import HeroShell from '@/components/hero/HeroShell';

export default function Home() {
  return (
    <main className="min-h-screen bg-tara-bg-dark text-white relative" aria-label="TARA home">
      <div className="absolute inset-0 -z-10">
        <HeroShell />
      </div>

      <section className="relative z-10 text-center p-12">
        <h1 className="text-5xl font-extrabold mb-4">Welcome to TARA</h1>
        <p className="text-lg text-white/70 max-w-xl mx-auto mb-6">The Sentient AI Creative Platform — explore TARA's creative canvas below.</p>
        <div className="flex items-center justify-center gap-4">
          <a className="px-6 py-3 rounded-full glass text-white" href="/dashboard">Go to Dashboard</a>
          <a className="px-6 py-3 rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30" href="/about">About</a>
        </div>
      </section>
    </main>
  );
}
