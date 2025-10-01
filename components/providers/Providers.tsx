"use client";
import React from 'react';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import WebVitalsInitializer from './WebVitalsInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <WebVitalsInitializer />
        {children}
      </ErrorBoundary>
    </ThemeProvider>
  );
}
