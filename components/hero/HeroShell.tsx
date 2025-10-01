"use client";
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false });

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-6 text-center">
      <p className="text-red-400">Failed to load hero.</p>
      <pre className="text-xs text-white/60 mt-2">{error.message}</pre>
    </div>
  );
}

class ErrorBoundary extends React.Component<any, { error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) return <ErrorFallback error={this.state.error} />;
    return this.props.children;
  }
}

export default function HeroShell() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="min-h-[420px] bg-gradient-to-b from-white/3 to-transparent" />}>
        <HeroScene />
      </Suspense>
    </ErrorBoundary>
  );
}
