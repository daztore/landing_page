import { createHash } from "node:crypto"
import { isIP } from "node:net"

export const normalizedClientIpHeader = "x-daztore-client-ip"

export interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
  now?: number
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export interface RateLimitStoreInput {
  keyHash: string
  limit: number
  windowMs: number
  now: number
}

export interface RateLimitStore {
  consume(input: RateLimitStoreInput): Promise<RateLimitResult>
}

export type RateLimitStoreMode = "memory" | "supabase"

interface RateLimitEntry {
  count: number
  resetAt: number
}

function normalizeKey(value: string) {
  return value.trim().slice(0, 200) || "unknown"
}

function normalizeLimit(value: number) {
  return Math.max(1, Math.floor(value))
}

function normalizeWindowMs(value: number) {
  return Math.max(1000, Math.floor(value))
}

export function hashRateLimitKey(value: string) {
  return createHash("sha256").update(normalizeKey(value)).digest("hex")
}

export function getRequestClientIp(request: Request) {
  const candidate = request.headers.get(normalizedClientIpHeader)?.trim()

  if (!candidate || candidate.length > 45 || isIP(candidate) === 0) {
    return "unknown"
  }

  return candidate.toLowerCase()
}

export function resolveRateLimitStoreMode(
  configuredMode: string | undefined,
  nodeEnv: string | undefined,
): RateLimitStoreMode {
  const normalizedMode = configuredMode?.trim().toLowerCase()

  if (!normalizedMode) {
    return nodeEnv?.trim().toLowerCase() === "production"
      ? "supabase"
      : "memory"
  }

  if (normalizedMode === "memory" || normalizedMode === "supabase") {
    return normalizedMode
  }

  throw new Error("Invalid rate-limit store mode.")
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, RateLimitEntry>()
  private readonly maxBuckets: number
  private nextCleanupAt = 0

  constructor(maxBuckets = 5000) {
    this.maxBuckets = Math.max(1, Math.floor(maxBuckets))
  }

  private cleanupExpiredBuckets(now: number) {
    if (now < this.nextCleanupAt && this.buckets.size < this.maxBuckets) {
      return
    }

    this.nextCleanupAt = now + 60_000

    for (const [key, entry] of this.buckets) {
      if (entry.resetAt <= now) {
        this.buckets.delete(key)
      }
    }

    while (this.buckets.size > this.maxBuckets) {
      const oldestKey = this.buckets.keys().next().value
      if (!oldestKey) {
        return
      }
      this.buckets.delete(oldestKey)
    }
  }

  async consume({
    keyHash,
    limit,
    windowMs,
    now,
  }: RateLimitStoreInput): Promise<RateLimitResult> {
    this.cleanupExpiredBuckets(now)

    const existing = this.buckets.get(keyHash)

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + windowMs
      this.buckets.set(keyHash, { count: 1, resetAt })

      return {
        allowed: true,
        limit,
        remaining: limit - 1,
        resetAt,
        retryAfterSeconds: 0,
      }
    }

    existing.count = Math.min(existing.count + 1, limit + 1)

    const allowed = existing.count <= limit
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existing.resetAt - now) / 1000),
    )

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - existing.count),
      resetAt: existing.resetAt,
      retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
    }
  }
}

export function createRateLimiter(store: RateLimitStore) {
  return async ({
    key,
    limit,
    windowMs,
    now = Date.now(),
  }: RateLimitOptions) => {
    return store.consume({
      keyHash: hashRateLimitKey(key),
      limit: normalizeLimit(limit),
      windowMs: normalizeWindowMs(windowMs),
      now,
    })
  }
}
