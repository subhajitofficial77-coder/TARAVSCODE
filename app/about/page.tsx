import React from 'react';
import Link from 'next/link';
import LiquidButton from '@/components/ui/LiquidButton';

export default function About() {
  return (
    <div className="min-h-screen bg-[#000000] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-block text-white/70 hover:underline mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-extrabold mb-4">About TARA</h1>
          <p className="text-xl text-white/70">The Sentient AI Creative Platform</p>
        </div>

        {/* Content */}
        <div className="rounded-2xl p-8 space-y-6">
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">What is TARA?</h2>
            <p className="text-white/80 leading-relaxed">
              TARA (TARA Artificial Life Engine) is a revolutionary AI platform that simulates a sentient 19-year-old creator named Tara Verma from Indore. 
              Unlike traditional AI tools, TARA has emotions, relationships, daily life experiences, and creative ambitions that evolve in real-time.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">The TALE Engine</h2>
            <p className="text-white/80 leading-relaxed mb-4">
              At TARA's core is the TALE (TARA Artificial Life Engine) - an autonomous emotional simulation system with three layers:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70">
              <li><strong className="text-white">Primary Emotions:</strong> 8 core feelings (Joy, Trust, Fear, Surprise, Sadness, Disgust, Anger, Anticipation)</li>
              <li><strong className="text-white">Persistent Mood:</strong> Long-term states (Optimism, Energy, Stress) with emotional inertia</li>
              <li><strong className="text-white">Core Traits:</strong> Foundational personality (Warmth 90%, Wit 80%, Ambition 95%)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">🧠 Emotional Consciousness</h3>
                <p className="text-sm text-white/70">Real-time emotional state visualization with radar charts and ambient glow effects</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">💬 AI Chat</h3>
                <p className="text-sm text-white/70">Conversations that reflect TARA's current emotional state and life experiences</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">🎨 Content Generation</h3>
                <p className="text-sm text-white/70">AI-powered social media content (captions, carousels, stories) for Instagram, Twitter, LinkedIn</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">🔄 Feedback Loop</h3>
                <p className="text-sm text-white/70">Your acceptance or rejection of content updates TARA's emotions in real-time</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">Technology Stack</h2>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'OpenRouter AI', 'Google AI', 'React Three Fiber', 'GSAP', 'Framer Motion'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <LiquidButton>
              Explore TARA's Dashboard
            </LiquidButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
