"use client";
import React from 'react';
import { ThemeProvider } from '@/lib/contexts/ThemeContext';
import { TaraStudioProvider } from '@/lib/contexts/TaraStudioContext';
import ErrorBoundary from '@/components/errors/ErrorBoundary';
import WebVitalsInitializer from './WebVitalsInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TaraStudioProvider>
        <ErrorBoundary>
          <WebVitalsInitializer />
          {children}
        </ErrorBoundary>
      </TaraStudioProvider>
    </ThemeProvider>
  );
}
