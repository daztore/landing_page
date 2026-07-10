import "server-only"

import { randomBytes } from "node:crypto"

import { buildPublicOrderAccessPath } from "@/features/orders/services/public-access-crypto"
import { getSiteUrl } from "@/lib/site-url"

export { hashPublicOrderToken } from "@/features/orders/services/public-access-crypto"

export function createPublicOrderToken() {
  return randomBytes(32).toString("base64url")
}

export function getPublicOrderTokenHint(token: string) {
  return token.slice(-8)
}

export function buildPublicOrderUrl(orderNumber: string, token: string) {
  const url = new URL(buildPublicOrderAccessPath(orderNumber, token), getSiteUrl())
  return url.toString()
}
