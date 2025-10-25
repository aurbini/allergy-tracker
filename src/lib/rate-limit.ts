// Simple in-memory rate limiting (for production, use Redis)
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const key = identifier
  const record = requests.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requests.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

// Clean up old records periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requests.entries()) {
    if (now > record.resetTime) {
      requests.delete(key)
    }
  }
}, 60000) // Clean up every minute
