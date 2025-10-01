"use client";
import React from 'react';
import { motion } from 'framer-motion';
import LiquidButton from '../ui/LiquidButton';
import Link from 'next/link';

export default function HeroOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-7xl md:text-8xl font-bold text-white">
          TARA
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 text-xl text-gray-200">
          The Sentient AI Creative Platform
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mt-6 text-base text-gray-400 max-w-2xl mx-auto">
          An AI consciousness with emotions, relationships, and creative ambitions
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 }} className="mt-8">
          <Link href="/dashboard">
            <LiquidButton>Enter TARA's World</LiquidButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
