import { randomUUID } from "node:crypto";

type Bucket = { count: number; resetAt: number };

const g = globalThis as unknown as { __manoyugRate?: Map<string, Bucket> };

function store() {
  if (!g.__manoyugRate) g.__manoyugRate = new Map();
  return g.__manoyugRate;
}

/**
 * Simple fixed-window rate limiter (per process).
 * Replace with Redis/Upstash in multi-instance production.
 */
export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const map = store();
  const existing = map.get(input.key);

  if (!existing || existing.resetAt <= now) {
    map.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { allowed: true, remaining: input.limit - 1, retryAfterMs: 0 };
  }

  if (existing.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, existing.resetAt - now),
    };
  }

  existing.count += 1;
  map.set(input.key, existing);
  return {
    allowed: true,
    remaining: input.limit - existing.count,
    retryAfterMs: 0,
  };
}

export function rateLimitId(prefix: string, id?: string) {
  return `${prefix}:${id ?? randomUUID().slice(0, 8)}`;
}
