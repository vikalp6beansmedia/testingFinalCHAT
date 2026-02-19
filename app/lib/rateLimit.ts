// Simple in-memory rate limiter (good for single-instance; use Redis for multi-instance)
const map = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.reset) {
    map.set(key, { count: 1, reset: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= maxRequests) {
    return false; // blocked
  }

  entry.count++;
  return true; // allowed
}
