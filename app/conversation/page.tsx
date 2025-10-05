"use client";
import React from 'react';
import { AnimatedAIChat } from '@/components/dashboard/AnimatedAIChat';
import DottedSurface from '@/components/hero/DottedSurface';

export default function ConversationPage() {
  return (
    <main className="min-h-screen p-6 bg-tara-bg-dark">
      <DottedSurface />
      <div className="max-w-4xl mx-auto relative z-10">
        <AnimatedAIChat />
      </div>
    </main>
  );
}
