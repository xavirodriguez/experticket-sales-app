/**
 * Base URL for Experticket API.
 */
export const EXPERTICKET_API_BASE_URL = "https://api.experticket.com"

/**
 * Helper to check for required parameters.
 */
export function checkParams(params: URLSearchParams | Record<string, any>, required: string[]): string | null {
  const p = params instanceof URLSearchParams ? Object.fromEntries(params.entries()) : params
  for (const field of required) {
    if (!p[field]) {
      return `Missing required parameter: ${field}`
    }
  }
  return null
}
