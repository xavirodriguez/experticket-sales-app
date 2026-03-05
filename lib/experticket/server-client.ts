/**
 * @module experticket-server-client
 * @description Server-side Experticket API client for communicating directly with the Experticket external API.
 *
 * @remarks
 * This module should ONLY be imported from API route handlers or server-side functions.
 * It uses environment variables for configuration.
 */

import { DEFAULT_FETCH_TIMEOUT, DEFAULT_FETCH_RETRIES } from "./constants"

const BASE_URL = process.env.EXPERTICKET_BASE_URL || ""
const PARTNER_ID = process.env.EXPERTICKET_PARTNER_ID || ""
const API_KEY = process.env.EXPERTICKET_API_KEY || ""
const DEFAULT_LANG = process.env.EXPERTICKET_DEFAULT_LANGUAGE || "en"

/**
 * Retrieves the Partner ID from environment variables.
 * @returns The Partner ID string.
 */
export function getPartnerId(): string {
  return PARTNER_ID
}

/**
 * Retrieves the default language code from environment variables.
 * @returns The default language code (e.g., "en", "es").
 */
export function getDefaultLanguage(): string {
  return DEFAULT_LANG
}

/**
 * Retrieves the raw API Key from environment variables.
 * @returns The plain API Key string.
 */
export function getApiKey(): string {
  return API_KEY
}

/**
 * Options for the {@link experticketFetch} function.
 */
interface FetchOptions {
  /** HTTP method to use. Defaults to "GET". */
  method?: "GET" | "POST" | "DELETE"
  /** Request body for POST or DELETE requests. */
  body?: unknown
  /** Query parameters to be appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>
  /** Timeout in milliseconds before the request is aborted. Defaults to 15000ms. */
  timeout?: number
  /** Number of retry attempts for idempotent GET requests. Defaults to 1. */
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
  const url = buildRequestUrl(path, options.params || {})
  const fetchOptions = prepareFetchOptions(options)
  const timeout = options.timeout ?? DEFAULT_FETCH_TIMEOUT
  const retries = options.retries ?? DEFAULT_FETCH_RETRIES

  return await executeRequestWithTimeout<T>(url.toString(), fetchOptions, timeout, retries)
}

/**
 * Builds a URL with query parameters.
 */
function buildRequestUrl(path: string, params: Record<string, unknown>): URL {
  const url = new URL(path, BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

/**
 * Prepares the standard fetch options.
 */
function prepareFetchOptions(options: FetchOptions): RequestInit {
  const { method = "GET", body } = options
  const fetchOptions: RequestInit = {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    cache: "no-store",
  }

  if (body && (method === "POST" || method === "DELETE")) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  return fetchOptions
}

/**
 * Executes a fetch request with a specified timeout.
 */
async function executeRequestWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeout: number,
  retries: number
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const optionsWithSignal = { ...options, signal: controller.signal }
    return await performFetchWithRetry<T>(url, optionsWithSignal, retries)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Performs the actual fetch with retry logic for idempotent GET requests.
 */
async function performFetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number
): Promise<T> {
  const maxAttempts = options.method === "GET" ? 1 + retries : 1
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchAndProcess<T>(url, options)
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        await delay(500 * attempt)
      }
    }
  }

  throw lastError
}

/**
 * Fetches the URL and processes the response.
 */
async function fetchAndProcess<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options)
  return await handleApiResponse<T>(response)
}

/**
 * Processes the API response, ensuring it is OK and parsing JSON.
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Experticket API error ${response.status}: ${errorText}`)
  }
  return (await response.json()) as T
}

/**
 * Simple delay helper.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
