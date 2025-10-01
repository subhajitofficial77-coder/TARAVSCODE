"use client";
import { useEffect } from 'react';

export default function WebVitalsInitializer() {
  useEffect(() => {
    // dynamic import inside client effect so it runs only on the browser
    (async () => {
      try {
        const mod = await import('@/lib/performance/webVitals');
        // module auto-initializes on import
        // keep a reference to avoid tree-shaking in some bundlers
        void mod;
      } catch (e) {
        // swallow error - optional logging
        // eslint-disable-next-line no-console
        console.warn('WebVitals failed to initialize', e);
      }
    })();
  }, []);

  return null;
}
