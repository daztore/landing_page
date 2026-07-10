import "server-only"

import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role"

import {
  createRateLimiter,
  getRequestClientIp,
  InMemoryRateLimitStore,
  resolveRateLimitStoreMode,
  type RateLimitOptions,
  type RateLimitResult,
  type RateLimitStore,
  type RateLimitStoreInput,
} from "./rate-limit-core"

interface SharedRateLimitRow {
  allowed: boolean
  max_requests: number
  remaining: number
  reset_at: string
  retry_after_seconds: number
}

export interface RateLimitCheckResult extends RateLimitResult {
  available: boolean
}

class SupabaseRateLimitStore implements RateLimitStore {
  async consume(input: RateLimitStoreInput): Promise<RateLimitResult> {
    const supabase = getSupabaseServiceRoleClient()
    if (!supabase) {
      throw new Error("Supabase service-role client is not configured.")
    }

    const { data, error } = await supabase.rpc("consume_rate_limit", {
      p_key_hash: input.keyHash,
      p_limit: input.limit,
      p_window_seconds: Math.ceil(input.windowMs / 1000),
    })

    if (error) {
      throw new Error("Shared rate-limit RPC failed.")
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | SharedRateLimitRow
      | null
      | undefined
    const resetAt = row ? Date.parse(row.reset_at) : Number.NaN

    if (
      !row ||
      typeof row.allowed !== "boolean" ||
      !Number.isFinite(row.max_requests) ||
      !Number.isFinite(row.remaining) ||
      !Number.isFinite(resetAt) ||
      !Number.isFinite(row.retry_after_seconds)
    ) {
      throw new Error("Shared rate-limit RPC returned an invalid response.")
    }

    return {
      allowed: row.allowed,
      limit: row.max_requests,
      remaining: row.remaining,
      resetAt,
      retryAfterSeconds: row.retry_after_seconds,
    }
  }
}

const inMemoryRateLimiter = createRateLimiter(new InMemoryRateLimitStore())
const sharedRateLimiter = createRateLimiter(new SupabaseRateLimitStore())
let nextStoreErrorLogAt = 0

function reportSharedStoreError(error: unknown) {
  const now = Date.now()
  if (now < nextStoreErrorLogAt) {
    return
  }

  nextStoreErrorLogAt = now + 60_000
  const message = error instanceof Error ? error.message : "Unknown error."
  console.error("[Rate Limit] Shared store unavailable:", message)
}

export async function checkRateLimit(
  options: RateLimitOptions,
): Promise<RateLimitCheckResult> {
  try {
    const storeMode = resolveRateLimitStoreMode(
      process.env.RATE_LIMIT_STORE,
      process.env.NODE_ENV,
    )
    const result = await (storeMode === "supabase"
      ? sharedRateLimiter(options)
      : inMemoryRateLimiter(options))

    return {
      ...result,
      available: true,
    }
  } catch (error) {
    reportSharedStoreError(error)

    const limit = Math.max(1, Math.floor(options.limit))
    const retryAfterSeconds = 60

    return {
      available: false,
      allowed: false,
      limit,
      remaining: 0,
      resetAt: Date.now() + retryAfterSeconds * 1000,
      retryAfterSeconds,
    }
  }
}

export { getRequestClientIp }
