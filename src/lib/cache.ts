// Simple in-memory cache for Firebase data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

// Prefetch data in the background
export async function prefetchData<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = getCachedData<T>(key);
  if (cached) {
    // Refresh in background
    fetchFn().then(data => setCachedData(key, data)).catch(() => {});
    return cached;
  }
  
  const data = await fetchFn();
  setCachedData(key, data);
  return data;
}
