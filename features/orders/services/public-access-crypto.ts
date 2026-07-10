import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto"

export const publicOrderAccessCookieName = "dzt_order_access"
export const publicOrderAccessTtlSeconds = 15 * 60
export const publicOrderAccessRedirectStatus = 303
export const publicOrderAccessMaximumCredentialLength = 1024

const credentialVersion = "v1"
const tokenHashPattern = /^[a-f0-9]{64}$/
const base64UrlPattern = /^[A-Za-z0-9_-]+$/
const allowedClockSkewSeconds = 30

interface PublicOrderAccessPayload {
  version: 1
  orderNumber: string
  tokenVersion: string
  issuedAt: number
  expiresAt: number
  nonce: string
}

interface CreatePublicOrderAccessCredentialInput {
  orderNumber: string
  publicAccessTokenHash: string
  secret: string
  nowMs?: number
}

interface VerifyPublicOrderAccessCredentialInput {
  credential: string
  expectedOrderNumber: string
  currentPublicAccessTokenHash: string
  secret: string
  nowMs?: number
}

interface PublicOrderAccessCookieOptionsInput {
  isProduction: boolean
  nowMs?: number
}

export function isPublicOrderAccessSecretValid(secret: unknown): secret is string {
  return (
    typeof secret === "string" &&
    secret.length >= 32 &&
    Buffer.byteLength(secret, "utf8") >= 32 &&
    secret.trim() === secret
  )
}

export function hashPublicOrderToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex")
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right)
}

export function publicOrderTokenMatches(token: string, expectedHash: string) {
  if (!token || !tokenHashPattern.test(expectedHash)) {
    return false
  }

  return safeEqual(
    Buffer.from(hashPublicOrderToken(token), "hex"),
    Buffer.from(expectedHash, "hex"),
  )
}

function deriveKey(secret: string, purpose: "signature" | "token-version") {
  return createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(`daztore:public-order-access:${credentialVersion}:${purpose}`, "utf8")
    .digest()
}

function createTokenVersion(
  secret: string,
  orderNumber: string,
  publicAccessTokenHash: string,
) {
  return createHmac("sha256", deriveKey(secret, "token-version"))
    .update(orderNumber, "utf8")
    .update("\0", "utf8")
    .update(publicAccessTokenHash, "utf8")
    .digest("base64url")
}

function createSignature(secret: string, signedValue: string) {
  return createHmac("sha256", deriveKey(secret, "signature"))
    .update(signedValue, "utf8")
    .digest("base64url")
}

function decodeBase64Url(value: string) {
  if (!value || !base64UrlPattern.test(value)) {
    return null
  }

  try {
    const decoded = Buffer.from(value, "base64url")
    return decoded.toString("base64url") === value ? decoded : null
  } catch {
    return null
  }
}

function isAccessPayload(value: unknown): value is PublicOrderAccessPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const payload = value as Partial<PublicOrderAccessPayload>

  return (
    payload.version === 1 &&
    typeof payload.orderNumber === "string" &&
    typeof payload.tokenVersion === "string" &&
    base64UrlPattern.test(payload.tokenVersion) &&
    Number.isSafeInteger(payload.issuedAt) &&
    Number.isSafeInteger(payload.expiresAt) &&
    typeof payload.nonce === "string" &&
    base64UrlPattern.test(payload.nonce)
  )
}

export function createPublicOrderAccessCredential({
  orderNumber,
  publicAccessTokenHash,
  secret,
  nowMs = Date.now(),
}: CreatePublicOrderAccessCredentialInput) {
  if (!isPublicOrderAccessSecretValid(secret)) {
    throw new Error("Public order access cookie secret is not configured securely.")
  }

  if (!orderNumber || !tokenHashPattern.test(publicAccessTokenHash)) {
    throw new Error("Public order access credential input is invalid.")
  }

  const issuedAt = Math.floor(nowMs / 1000)
  const payload: PublicOrderAccessPayload = {
    version: 1,
    orderNumber,
    tokenVersion: createTokenVersion(secret, orderNumber, publicAccessTokenHash),
    issuedAt,
    expiresAt: issuedAt + publicOrderAccessTtlSeconds,
    nonce: randomBytes(16).toString("base64url"),
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  )
  const signedValue = `${credentialVersion}.${encodedPayload}`
  const signature = createSignature(secret, signedValue)

  return `${signedValue}.${signature}`
}

export function verifyPublicOrderAccessCredential({
  credential,
  expectedOrderNumber,
  currentPublicAccessTokenHash,
  secret,
  nowMs = Date.now(),
}: VerifyPublicOrderAccessCredentialInput) {
  if (
    !isPublicOrderAccessSecretValid(secret) ||
    !credential ||
    credential.length > publicOrderAccessMaximumCredentialLength ||
    !expectedOrderNumber ||
    !tokenHashPattern.test(currentPublicAccessTokenHash)
  ) {
    return false
  }

  const parts = credential.split(".")

  if (parts.length !== 3 || parts[0] !== credentialVersion) {
    return false
  }

  const [version, encodedPayload, providedSignature] = parts
  const signedValue = `${version}.${encodedPayload}`
  const signatureBuffer = decodeBase64Url(providedSignature)
  const expectedSignatureBuffer = decodeBase64Url(
    createSignature(secret, signedValue),
  )

  if (
    !signatureBuffer ||
    !expectedSignatureBuffer ||
    !safeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return false
  }

  const payloadBuffer = decodeBase64Url(encodedPayload)

  if (!payloadBuffer || payloadBuffer.length > 512) {
    return false
  }

  let payload: unknown
  try {
    payload = JSON.parse(payloadBuffer.toString("utf8"))
  } catch {
    return false
  }

  if (!isAccessPayload(payload) || payload.orderNumber !== expectedOrderNumber) {
    return false
  }

  const nowSeconds = Math.floor(nowMs / 1000)

  if (
    payload.issuedAt > nowSeconds + allowedClockSkewSeconds ||
    payload.expiresAt <= nowSeconds ||
    payload.expiresAt - payload.issuedAt !== publicOrderAccessTtlSeconds
  ) {
    return false
  }

  const providedTokenVersion = decodeBase64Url(payload.tokenVersion)
  const currentTokenVersion = decodeBase64Url(
    createTokenVersion(secret, expectedOrderNumber, currentPublicAccessTokenHash),
  )

  return Boolean(
    providedTokenVersion &&
      currentTokenVersion &&
      safeEqual(providedTokenVersion, currentTokenVersion),
  )
}

export function buildPublicOrderCleanPath(orderNumber: string) {
  return `/order/${encodeURIComponent(orderNumber)}`
}

export function buildPublicOrderAccessPath(orderNumber: string, token: string) {
  return `${buildPublicOrderCleanPath(orderNumber)}/access?token=${encodeURIComponent(token)}`
}

export function getPublicOrderAccessCookieOptions(
  orderNumber: string,
  { isProduction, nowMs = Date.now() }: PublicOrderAccessCookieOptionsInput,
) {
  return {
    httpOnly: true as const,
    secure: isProduction,
    sameSite: "lax" as const,
    path: buildPublicOrderCleanPath(orderNumber),
    maxAge: publicOrderAccessTtlSeconds,
    expires: new Date(nowMs + publicOrderAccessTtlSeconds * 1000),
  }
}
