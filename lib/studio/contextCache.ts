type CachedResponse = { data: any; timestamp: number } | null;

let cache: CachedResponse = null;

export function getContextCache() {
  if (!cache) return null;
  return cache.data;
}

export function setContextCache(data: any) {
  cache = { data, timestamp: Date.now() };
}

export function clearContextCache() {
  cache = null;
}

export function cacheAgeMs() {
  if (!cache) return null;
  return Date.now() - cache.timestamp;
}

export default { getContextCache, setContextCache, clearContextCache, cacheAgeMs };
