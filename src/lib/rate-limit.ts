interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export function rateLimit(req: Request): { allowed: boolean; retryAfter: number } {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry) {
    store.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, retryAfter: 0 };
  }

  if (now - entry.firstAttempt > WINDOW_MS) {
    // Window expired, reset
    store.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.firstAttempt)) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, retryAfter: 0 };
}

// Optional: expose for tests
export function _resetRateLimitStore() {
  store.clear();
}
