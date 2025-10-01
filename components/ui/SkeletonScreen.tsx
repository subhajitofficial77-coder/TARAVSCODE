"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export function Skeleton({ className, variant = 'default' }: { className?: string; variant?: 'default' | 'shimmer' | 'pulse' }) {
  return (
    <motion.div
      className={cn(
        'bg-white/5 rounded',
        variant === 'shimmer' && 'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
        variant === 'pulse' && 'animate-pulse',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-48" variant="shimmer" />
      <Skeleton className="h-32 w-full" variant="shimmer" />
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" variant="shimmer" />
        <Skeleton className="h-4 w-20" variant="shimmer" />
        <Skeleton className="h-4 w-20" variant="shimmer" />
      </div>
    </div>
  );
}

export function SkeletonRadarChart() {
  return (
    <div className="flex items-center justify-center h-64">
      <Skeleton className="w-64 h-64 rounded-full" variant="pulse" />
    </div>
  );
}

export function SkeletonChatMessage({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="space-y-2 max-w-[70%]">
        <Skeleton className="h-4 w-48" variant="shimmer" />
        <Skeleton className="h-4 w-64" variant="shimmer" />
      </div>
    </div>
  );
}

export function SkeletonContentCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-8 rounded-full" variant="pulse" />
        <Skeleton className="h-6 w-24" variant="shimmer" />
      </div>
      <Skeleton className="h-24 w-full" variant="shimmer" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
        <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
        <Skeleton className="h-6 w-16 rounded-full" variant="shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGroup({ count, component: Component, delay = 0.1 }: { count: number; component: React.ComponentType<any>; delay?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * delay }}
        >
          <Component />
        </motion.div>
      ))}
    </>
  );
}

export default Skeleton;
