import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildPublicOrderAccessPath,
  buildPublicOrderCleanPath,
  createPublicOrderAccessCredential,
  getPublicOrderAccessCookieOptions,
  hashPublicOrderToken,
  isPublicOrderAccessSecretValid,
  publicOrderAccessRedirectStatus,
  publicOrderAccessTtlSeconds,
  publicOrderTokenMatches,
  verifyPublicOrderAccessCredential,
} from "../../features/orders/services/public-access-crypto.js"

const orderNumber = "DZT-20260710-00001"
const rawToken = "valid_public_order_token_0123456789ABCDEFG"
const signingSecret = "0123456789abcdef0123456789abcdef0123456789abcdef"
const issuedAtMs = Date.UTC(2026, 6, 10, 8, 0, 0)

function issueCredential(publicAccessTokenHash = hashPublicOrderToken(rawToken)) {
  return createPublicOrderAccessCredential({
    orderNumber,
    publicAccessTokenHash,
    secret: signingSecret,
    nowMs: issuedAtMs,
  })
}

test("token valid menghasilkan credential signed dan kebijakan redirect/cookie aman", () => {
  const tokenHash = hashPublicOrderToken(rawToken)
  const credential = issueCredential(tokenHash)
  const cleanPath = buildPublicOrderCleanPath(orderNumber)
  const accessPath = buildPublicOrderAccessPath(orderNumber, rawToken)
  const cookieOptions = getPublicOrderAccessCookieOptions(orderNumber, {
    isProduction: true,
    nowMs: issuedAtMs,
  })

  assert.equal(publicOrderTokenMatches(rawToken, tokenHash), true)
  assert.equal(
    verifyPublicOrderAccessCredential({
      credential,
      expectedOrderNumber: orderNumber,
      currentPublicAccessTokenHash: tokenHash,
      secret: signingSecret,
      nowMs: issuedAtMs,
    }),
    true,
  )
  assert.equal(accessPath, `${cleanPath}/access?token=${rawToken}`)
  assert.equal(cleanPath.includes("?"), false)
  assert.equal(cleanPath.includes(rawToken), false)
  assert.equal(publicOrderAccessRedirectStatus, 303)
  assert.equal(cookieOptions.httpOnly, true)
  assert.equal(cookieOptions.secure, true)
  assert.equal(cookieOptions.sameSite, "lax")
  assert.equal(cookieOptions.path, cleanPath)
  assert.equal(cookieOptions.maxAge, publicOrderAccessTtlSeconds)
  assert.equal(credential.includes(rawToken), false)
  assert.equal(credential.includes(tokenHash), false)
})

test("token invalid tidak cocok dengan hash token aktif", () => {
  const tokenHash = hashPublicOrderToken(rawToken)

  assert.equal(publicOrderTokenMatches(`${rawToken}x`, tokenHash), false)
  assert.equal(publicOrderTokenMatches("", tokenHash), false)
  assert.equal(publicOrderTokenMatches(rawToken, "invalid-hash"), false)
})

test("credential yang ditamper ditolak", () => {
  const tokenHash = hashPublicOrderToken(rawToken)
  const credential = issueCredential(tokenHash)
  const finalCharacter = credential.at(-1)
  const tampered = `${credential.slice(0, -1)}${finalCharacter === "A" ? "B" : "A"}`

  assert.equal(
    verifyPublicOrderAccessCredential({
      credential: tampered,
      expectedOrderNumber: orderNumber,
      currentPublicAccessTokenHash: tokenHash,
      secret: signingSecret,
      nowMs: issuedAtMs,
    }),
    false,
  )
})

test("credential yang expired ditolak", () => {
  const tokenHash = hashPublicOrderToken(rawToken)
  const credential = issueCredential(tokenHash)

  assert.equal(
    verifyPublicOrderAccessCredential({
      credential,
      expectedOrderNumber: orderNumber,
      currentPublicAccessTokenHash: tokenHash,
      secret: signingSecret,
      nowMs: issuedAtMs + publicOrderAccessTtlSeconds * 1000,
    }),
    false,
  )
})

test("regenerasi link membatalkan credential yang terikat ke hash lama", () => {
  const oldTokenHash = hashPublicOrderToken(rawToken)
  const newTokenHash = hashPublicOrderToken(
    "regenerated_public_order_token_9876543210ZYXWV",
  )
  const credential = issueCredential(oldTokenHash)

  assert.equal(
    verifyPublicOrderAccessCredential({
      credential,
      expectedOrderNumber: orderNumber,
      currentPublicAccessTokenHash: newTokenHash,
      secret: signingSecret,
      nowMs: issuedAtMs,
    }),
    false,
  )
})

test("secret yang hilang atau terlalu pendek ditolak fail-closed", () => {
  assert.equal(isPublicOrderAccessSecretValid(undefined), false)
  assert.equal(isPublicOrderAccessSecretValid("short-secret"), false)
  assert.equal(isPublicOrderAccessSecretValid("\u00e9".repeat(16)), false)
  assert.equal(isPublicOrderAccessSecretValid("x".repeat(32)), true)
})
