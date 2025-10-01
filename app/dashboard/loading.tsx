"use client";
import React from 'react';
import { Skeleton, SkeletonCard, SkeletonRadarChart, SkeletonChatMessage, SkeletonGroup, SkeletonContentCard } from '@/components/ui/SkeletonScreen';

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-tara-bg-dark p-4 md:p-8" role="status" aria-label="Loading dashboard">
      <div className="max-w-7xl mx-auto mb-8">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <SkeletonCard />

        <div className="glass rounded-2xl p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
          <SkeletonGroup count={3} component={SkeletonContentCard} />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mt-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          <SkeletonGroup count={4} component={(props: any) => <SkeletonChatMessage {...props} />} />
        </div>
      </div>
    </main>
  );
}
