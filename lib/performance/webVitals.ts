// Lightweight web vitals collector + logger
// This file intentionally keeps dependencies minimal to avoid adding runtime weight.
export function sendToAnalytics(metric: { name: string; value: number; delta?: number; id?: string }) {
  // TODO: wire to your analytics endpoint (e.g., /api/telemetry)
  // For now, just log to console in non-production or when DEBUG is set
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[webVitals]', metric);
    }
  } catch (_) {
    // swallow
  }
}

// auto-init for client-side only
if (typeof window !== 'undefined') {
  // dynamic import to avoid bundling large modules when not needed
  (async () => {
    try {
      // dynamic import guarded; ts-ignore avoids compile error when types aren't installed
      // @ts-ignore
      const { getCLS, getFID, getLCP, getFCP, getTTFB } = await import('web-vitals');
      getCLS(sendToAnalytics);
      getFID(sendToAnalytics);
      getLCP(sendToAnalytics);
      getFCP(sendToAnalytics);
      getTTFB(sendToAnalytics);
    } catch (e) {
      // no-op when web-vitals isn't available
    }
  })();
}

export default sendToAnalytics;
