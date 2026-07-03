import "server-only"

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
  now?: number
}

interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

const buckets = new Map<string, RateLimitEntry>()
const maxBuckets = 5000
let nextCleanupAt = 0

function normalizeKey(value: string) {
  return value.trim().slice(0, 200) || "unknown"
}

function normalizeHeaderValue(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized.slice(0, 120) : null
}

function cleanupExpiredBuckets(now: number) {
  if (now < nextCleanupAt && buckets.size < maxBuckets) {
    return
  }

  nextCleanupAt = now + 60_000

  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) {
      buckets.delete(key)
    }
  }

  while (buckets.size > maxBuckets) {
    const oldestKey = buckets.keys().next().value
    if (!oldestKey) {
      return
    }
    buckets.delete(oldestKey)
  }
}

export function getRequestClientIp(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .find(Boolean)

  return (
    normalizeHeaderValue(forwardedFor) ||
    normalizeHeaderValue(request.headers.get("x-real-ip")) ||
    normalizeHeaderValue(request.headers.get("cf-connecting-ip")) ||
    "unknown"
  )
}

export function checkInMemoryRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: RateLimitOptions): RateLimitResult {
  cleanupExpiredBuckets(now)

  const normalizedKey = normalizeKey(key)
  const normalizedLimit = Math.max(1, Math.floor(limit))
  const normalizedWindowMs = Math.max(1000, Math.floor(windowMs))
  const existing = buckets.get(normalizedKey)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + normalizedWindowMs
    buckets.set(normalizedKey, { count: 1, resetAt })

    return {
      allowed: true,
      limit: normalizedLimit,
      remaining: normalizedLimit - 1,
      resetAt,
      retryAfterSeconds: 0,
    }
  }

  existing.count += 1

  const allowed = existing.count <= normalizedLimit
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  )

  return {
    allowed,
    limit: normalizedLimit,
    remaining: Math.max(0, normalizedLimit - existing.count),
    resetAt: existing.resetAt,
    retryAfterSeconds: allowed ? 0 : retryAfterSeconds,
  }
}
