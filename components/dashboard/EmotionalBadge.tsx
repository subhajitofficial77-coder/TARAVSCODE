"use client";
import React from 'react';

export default function EmotionalBadge({ label = 'Joyful (85%)' }: { label?: string }) {
  return (
    <div className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
      <div className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
      <span className="text-sm font-medium text-white">Currently feeling: {label}</span>
    </div>
  );
}
