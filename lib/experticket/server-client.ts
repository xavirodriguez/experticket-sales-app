/**
 * @module experticket-server-client
 * @description Server-side Experticket API client for communicating directly with the Experticket external API.
 *
 * @remarks
 * This module should ONLY be imported from API route handlers or server-side functions.
 * It uses environment variables for configuration.
 */

const BASE_URL = process.env.EXPERTICKET_BASE_URL || ""
const PARTNER_ID = process.env.EXPERTICKET_PARTNER_ID || ""
const API_KEY = process.env.EXPERTICKET_API_KEY || ""
const DEFAULT_LANG = process.env.EXPERTICKET_DEFAULT_LANGUAGE || "en"

/**
 * Retrieves the Partner ID from environment variables.
 * @returns The Partner ID string.
 */
export function getPartnerId() {
  return PARTNER_ID
}

/**
 * Retrieves the default language code from environment variables.
 * @returns The default language code (e.g., "en", "es").
 */
export function getDefaultLanguage() {
  return DEFAULT_LANG
}

/**
 * Retrieves the API Key from environment variables and encodes it for URL safety.
 * @returns The URI-encoded API Key.
 */
export function getEncodedApiKey() {
  return encodeURIComponent(API_KEY)
}

/**
 * Retrieves the raw API Key from environment variables.
 * @returns The plain API Key string.
 */
export function getRawApiKey() {
  return API_KEY
}

/**
 * Options for the {@link experticketFetch} function.
 */
interface FetchOptions {
  /** HTTP method to use. Defaults to "GET". */
  method?: "GET" | "POST" | "DELETE"
  /** Request body for POST or DELETE requests. Can be an object or string. */
  body?: unknown
  /** Query parameters to be appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>
  /** Timeout in milliseconds before the request is aborted. Defaults to 15000ms. */
  timeout?: number
  /** Number of retry attempts for idempotent GET requests. Defaults to 0. */
  retries?: number
}

/**
 * Performs a server-side fetch to the Experticket API.
 * Handles URL building, timeouts, retries (for GET), and JSON parsing.
 *
 * @param path - The API endpoint path relative to the BASE_URL.
 * @param options - Configuration for the request (method, body, params, etc.).
 * @returns A promise that resolves to the parsed JSON response of type T.
 *
 * @throws {Error} If the API response is not OK or if a network/timeout error occurs.
 *
 * @example
 * ```typescript
 * const catalog = await experticketFetch<CatalogResponse>('catalog', {
 *   params: { LanguageCode: 'en' }
 * });
 * ```
 */
export async function experticketFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, params = {}, timeout = 15000, retries = 0 } = options

  // Build URL
  const url = new URL(path, BASE_URL)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") {
      url.searchParams.set(k, String(v))
    }
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  const fetchOptions: RequestInit = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    cache: "no-store",
  }

  if (body && (method === "POST" || method === "DELETE")) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  let lastError: unknown
  const attempts = 1 + (method === "GET" ? retries : 0) // only retry idempotent GETs

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url.toString(), fetchOptions)
      clearTimeout(timer)

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(`Experticket API error ${res.status}: ${text}`)
      }

      const data = await res.json()
      return data as T
    } catch (err) {
      lastError = err
      if (attempt < attempts - 1) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
      }
    }
  }

  clearTimeout(timer)
  throw lastError
}
