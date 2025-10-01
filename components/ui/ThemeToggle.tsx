"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      role="switch"
      aria-checked={theme === 'light'}
      className="relative glass rounded-full p-1 w-16 h-8 flex items-center"
    >
      <motion.div
        className="absolute w-6 h-6 rounded-full bg-yellow-300"
        animate={{ x: theme === 'dark' ? 2 : 34 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ top: 4 }}
      />

      <div className="relative z-10 w-full flex justify-between px-2 text-white/80">
        <Moon className="w-4 h-4" />
        <Sun className="w-4 h-4" />
      </div>
    </button>
  );
}
