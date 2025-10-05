"use client";
import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type LiquidButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  colors?: Record<string, string>;
};

function LayeredSVG({ speed }: { speed: number }) {
  // 5 layered radial gradients with differing transforms to create liquid motion
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="l1" cx="30%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="60%" stopColor="#FF7A00" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FF2D95" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="l2" cx="70%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#4A90E2" stopOpacity="1" />
          <stop offset="60%" stopColor="#6C3BFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9B59B6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="l3" cx="50%" cy="70%" r="70%">
          <stop offset="0%" stopColor="#2ECC71" stopOpacity="1" />
          <stop offset="60%" stopColor="#00C9A7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.rect
        x="0"
        y="0"
        width="600"
        height="120"
        fill="url(#l1)"
        style={{ mixBlendMode: 'screen' }}
        animate={{ x: [0, -80, 0], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 20 / speed, ease: 'linear' }}
      />

      <motion.rect
        x="0"
        y="0"
        width="600"
        height="120"
        fill="url(#l2)"
        style={{ mixBlendMode: 'overlay', opacity: 0.9 }}
        animate={{ x: [0, 60, 0], y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 30 / speed, ease: 'linear' }}
      />

      <motion.rect
        x="0"
        y="0"
        width="600"
        height="120"
        fill="url(#l3)"
        style={{ mixBlendMode: 'color-dodge', opacity: 0.7 }}
        animate={{ x: [0, -40, 0], y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 25 / speed, ease: 'linear' }}
      />

      {/* subtle overlay for depth */}
      <rect x="0" y="0" width="600" height="120" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}

export default function LiquidButton({ children, className = '', colors, ...props }: LiquidButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotion();
  // increase hover speed so motion feels livelier when interacting
  const speed = useMemo(() => (isHovered ? 4 : 1), [isHovered]);

  return (
    <button
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-full px-6 py-2 text-white font-semibold transition-transform duration-200 ease-out shadow-lg hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/30 ${className}`}
      aria-label={props['aria-label'] || 'Call to action'}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        {!prefersReduced && <LayeredSVG speed={speed} />}
        {prefersReduced && <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-500 opacity-80" />}
      </div>
      <span className="relative z-10 block px-2 py-0.5">{children}</span>
    </button>
  );
}
