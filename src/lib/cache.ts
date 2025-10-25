// Simple in-memory cache (for production, use Redis)
const cache = new Map<string, { data: any; expires: number }>()

export function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (!cached || Date.now() > cached.expires) {
    cache.delete(key)
    return null
  }
  return cached.data
}

export function setCached<T>(
  key: string,
  data: T,
  ttlMs: number = 24 * 60 * 60 * 1000
): void {
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
  })
}

// Clean up expired cache entries
setInterval(
  () => {
    const now = Date.now()
    for (const [key, cached] of cache.entries()) {
      if (now > cached.expires) {
        cache.delete(key)
      }
    }
  },
  5 * 60 * 1000
)
