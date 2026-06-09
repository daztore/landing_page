export function buildWhatsAppUrl(number: string, message?: string) {
  const normalizedNumber = number.replace(/\D/g, "")
  const baseUrl = `https://wa.me/${normalizedNumber}`

  if (!message) {
    return baseUrl
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`
}
