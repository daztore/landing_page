import "server-only"

import {
  createPublicOrderAccessCredential,
  getPublicOrderAccessCookieOptions,
  isPublicOrderAccessSecretValid,
  publicOrderAccessCookieName,
  verifyPublicOrderAccessCredential,
} from "@/features/orders/services/public-access-crypto"

function getPublicOrderAccessSecret() {
  const secret = process.env.ORDER_ACCESS_COOKIE_SECRET
  return isPublicOrderAccessSecretValid(secret) ? secret : null
}

export function issuePublicOrderAccessCookie(
  orderNumber: string,
  publicAccessTokenHash: string,
  nowMs = Date.now(),
) {
  const secret = getPublicOrderAccessSecret()

  if (!secret) {
    return null
  }

  return {
    name: publicOrderAccessCookieName,
    value: createPublicOrderAccessCredential({
      orderNumber,
      publicAccessTokenHash,
      secret,
      nowMs,
    }),
    options: getPublicOrderAccessCookieOptions(orderNumber, {
      isProduction: process.env.NODE_ENV === "production",
      nowMs,
    }),
  }
}

export function hasValidPublicOrderAccess(
  credential: string,
  orderNumber: string,
  currentPublicAccessTokenHash: string,
) {
  const secret = getPublicOrderAccessSecret()

  if (!secret) {
    return false
  }

  return verifyPublicOrderAccessCredential({
    credential,
    expectedOrderNumber: orderNumber,
    currentPublicAccessTokenHash,
    secret,
  })
}
