import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  createRateLimiter,
  getRequestClientIp,
  InMemoryRateLimitStore,
  normalizedClientIpHeader,
  resolveRateLimitStoreMode,
  type RateLimitStore,
  type RateLimitStoreInput,
} from "../../lib/security/rate-limit-core.js"

test("client IP only comes from the Nginx-normalized header", () => {
  const proxyResolvedIp = "203.0.113.10"
  const normalRequest = new Request("https://example.test/api/leads", {
    headers: {
      [normalizedClientIpHeader]: proxyResolvedIp,
    },
  })
  const spoofedRequest = new Request("https://example.test/api/leads", {
    headers: {
      [normalizedClientIpHeader]: proxyResolvedIp,
      "cf-connecting-ip": "198.51.100.20",
      "x-forwarded-for": "198.51.100.21, 198.51.100.22",
      "x-real-ip": "198.51.100.23",
    },
  })
  const forwardingHeadersOnly = new Request("https://example.test/api/leads", {
    headers: {
      "cf-connecting-ip": "198.51.100.20",
      "x-forwarded-for": "198.51.100.21",
      "x-real-ip": "198.51.100.23",
    },
  })

  assert.equal(getRequestClientIp(normalRequest), proxyResolvedIp)
  assert.equal(getRequestClientIp(spoofedRequest), proxyResolvedIp)
  assert.equal(getRequestClientIp(forwardingHeadersOnly), "unknown")
})

test("invalid normalized client IP falls back to unknown", () => {
  const request = new Request("https://example.test/api/leads", {
    headers: {
      [normalizedClientIpHeader]: "attacker-selected-key",
    },
  })

  assert.equal(getRequestClientIp(request), "unknown")
})

test("store selection defaults production to shared and local/test to memory", () => {
  assert.equal(resolveRateLimitStoreMode(undefined, "development"), "memory")
  assert.equal(resolveRateLimitStoreMode(undefined, "test"), "memory")
  assert.equal(resolveRateLimitStoreMode(undefined, "production"), "supabase")
  assert.equal(resolveRateLimitStoreMode("memory", "production"), "memory")
  assert.equal(resolveRateLimitStoreMode("supabase", "development"), "supabase")
  assert.throws(
    () => resolveRateLimitStoreMode("unsupported", "production"),
    /Invalid rate-limit store mode/,
  )
})

test("Compose explicitly selects memory locally and Supabase in production", async () => {
  const [localOverride, productionCompose] = await Promise.all([
    readFile("docker-compose.override.yml", "utf8"),
    readFile("docker-compose.production.yml", "utf8"),
  ])

  assert.match(localOverride, /RATE_LIMIT_STORE:\s*memory/)
  assert.match(productionCompose, /RATE_LIMIT_STORE:\s*supabase/)
})

test("Nginx overwrites the app-facing IP and does not append client forwarding headers", async () => {
  const config = await readFile("docker/nginx/default.conf", "utf8")
  const normalizedHeaderAssignments =
    config.match(/proxy_set_header X-Daztore-Client-IP \$remote_addr;/g) ?? []

  assert.equal(normalizedHeaderAssignments.length, 3)
  assert.doesNotMatch(config, /\$proxy_add_x_forwarded_for/)
  assert.match(config, /proxy_set_header X-Forwarded-For \$remote_addr;/)
  assert.match(
    config,
    /log_format daztore_path_only[\s\S]*\$request_method \$uri \$server_protocol/,
  )
  assert.doesNotMatch(config, /\$request(?!_)/)
  assert.doesNotMatch(config, /\$(?:request_uri|args|http_referer)\b/)
  assert.match(config, /map \$uri \$daztore_referrer_policy/)
  assert.match(config, /~\^\/order\(\?:\/\|\$\) "no-referrer";/)
  assert.match(
    config,
    /add_header Referrer-Policy \$daztore_referrer_policy always;/,
  )
  assert.match(config, /proxy_hide_header Referrer-Policy;/)
  assert.match(
    config,
    /location \^~ \/order\/[\s\S]*error_log \/dev\/null;/,
  )
})

test("in-memory limiter rejects requests above the limit and resets the window", async () => {
  const limiter = createRateLimiter(new InMemoryRateLimitStore())
  const options = {
    key: "feedback-submit:203.0.113.10",
    limit: 2,
    windowMs: 10_000,
  }

  const first = await limiter({ ...options, now: 1_000 })
  const second = await limiter({ ...options, now: 2_000 })
  const denied = await limiter({ ...options, now: 3_000 })
  const reset = await limiter({ ...options, now: 11_000 })

  assert.deepEqual(
    [first.allowed, second.allowed, denied.allowed, reset.allowed],
    [true, true, false, true],
  )
  assert.equal(denied.retryAfterSeconds, 8)
  assert.equal(reset.remaining, 1)
})

test("rate-limit expiry matches the requested TTL window", async () => {
  const limiter = createRateLimiter(new InMemoryRateLimitStore())
  const now = 50_000
  const windowMs = 15_000
  const result = await limiter({
    key: "admin-password-recovery-ip:203.0.113.10",
    limit: 5,
    windowMs,
    now,
  })

  assert.equal(result.resetAt, now + windowMs)
})

test("two limiter instances enforce one counter when they share a store", async () => {
  const sharedStore = new InMemoryRateLimitStore()
  const firstInstance = createRateLimiter(sharedStore)
  const secondInstance = createRateLimiter(sharedStore)
  const options = {
    key: "lead-submit:203.0.113.10",
    limit: 1,
    windowMs: 60_000,
    now: 10_000,
  }

  const first = await firstInstance(options)
  const second = await secondInstance(options)

  assert.equal(first.allowed, true)
  assert.equal(second.allowed, false)
})

test("store keys are fixed-length hashes and do not contain personal identifiers", async () => {
  let capturedInput: RateLimitStoreInput | undefined
  const store: RateLimitStore = {
    async consume(input) {
      capturedInput = input
      return {
        allowed: true,
        limit: input.limit,
        remaining: input.limit - 1,
        resetAt: input.now + input.windowMs,
        retryAfterSeconds: 0,
      }
    },
  }
  const limiter = createRateLimiter(store)
  const phoneNumber = "6281234567890"

  await limiter({
    key: `lead-submit-phone:${phoneNumber}`,
    limit: 4,
    windowMs: 60_000,
    now: 1_000,
  })

  assert.ok(capturedInput)
  assert.match(capturedInput.keyHash, /^[a-f0-9]{64}$/)
  assert.doesNotMatch(capturedInput.keyHash, new RegExp(phoneNumber))
})

test("shared-store migration uses atomic upsert and service-role-only access", async () => {
  const migration = await readFile(
    "supabase/migrations/009_create_rate_limit_store.sql",
    "utf8",
  )

  assert.match(migration, /on conflict \(key_hash\) do update/i)
  assert.match(
    migration,
    /grant execute on function public\.consume_rate_limit[\s\S]*to service_role;/i,
  )
  assert.match(
    migration,
    /revoke all on table public\.rate_limit_buckets from public, anon, authenticated;/i,
  )
})
