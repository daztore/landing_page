import "server-only"

import { createHash, randomBytes } from "node:crypto"

import { getSiteUrl } from "@/lib/site-url"

export function createPublicOrderToken() {
  return randomBytes(32).toString("base64url")
}

export function hashPublicOrderToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

export function getPublicOrderTokenHint(token: string) {
  return token.slice(-8)
}

export function buildPublicOrderUrl(orderNumber: string, token: string) {
  const url = getSiteUrl()
  url.pathname = `/order/${orderNumber}`
  url.search = ""
  url.searchParams.set("token", token)
  return url.toString()
}
