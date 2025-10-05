export async function initializeIfNeeded() {
  // Use an absolute URL so this works from server-side code (Route handlers)
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const checkUrl = new URL('/api/studio/check-initialization', base).toString();
  const checkRes = await fetch(checkUrl);
  const { initialized } = await checkRes.json();
  
  if (!initialized) {
    const seedUrl = new URL('/api/studio/auto-seed', base).toString();
    const seedRes = await fetch(seedUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!seedRes.ok) {
      throw new Error(`Auto-seed failed: ${seedRes.status} ${seedRes.statusText}`);
    }

    const json = await seedRes.json();
    if (!json.success) {
      throw new Error(json.error || 'Auto-seed failed');
    }
  }
}