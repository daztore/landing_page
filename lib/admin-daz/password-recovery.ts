export const ADMIN_PASSWORD_RECOVERY_COOKIE = "admin-password-recovery"
export const ADMIN_PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS = 15 * 60
export const ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT = "/admin-daz/reset-password"

export function getSafeAdminRecoveryNext(requestedNext: string | null) {
  if (
    !requestedNext ||
    requestedNext.startsWith("//") ||
    !requestedNext.startsWith("/admin-daz/")
  ) {
    return ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT
  }

  try {
    const baseUrl = "https://daztore.invalid"
    const parsed = new URL(requestedNext, baseUrl)

    if (parsed.origin !== baseUrl || !parsed.pathname.startsWith("/admin-daz/")) {
      return ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return ADMIN_PASSWORD_RECOVERY_DEFAULT_NEXT
  }
}
