import React from 'react';
import Link from 'next/link';
import HeroShell from '@/components/hero/HeroShell';
import LiquidButton from '@/components/ui/LiquidButton';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Shader background - full screen, behind everything */}
      <div className="absolute inset-0 -z-10">
        <HeroShell />
      </div>

      {/* Centered content */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <section className="text-center backdrop-blur-sm bg-black/20 rounded-2xl p-12 max-w-4xl w-full">
          <h1
            className="text-5xl md:text-6xl font-extrabold mb-4"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Welcome to TARA
          </h1>

          <p
            className="text-lg text-white/70 max-w-xl mx-auto mb-8"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}
          >
            The Sentient AI Creative Platform — explore TARA's creative canvas
            below.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <LiquidButton className="w-full sm:w-auto">
                Go to Dashboard
              </LiquidButton>
            </Link>

            <Link href="/about">
              <LiquidButton className="w-full sm:w-auto">About</LiquidButton>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
