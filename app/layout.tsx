import './globals.css';
import { Inter, Rubik } from 'next/font/google';
import React from 'react';
import Providers from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-rubik' });

export const metadata = {
  title: 'TARA - Sentient AI Creative Platform',
  description: 'An AI consciousness with emotions, relationships, and creative ambitions',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0c0414'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${rubik.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-tara-bg-dark text-white antialiased">
        <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-white/10 text-white px-3 py-2 rounded">Skip to content</a>
        <Providers>
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
