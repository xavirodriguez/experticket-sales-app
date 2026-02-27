/**
 * @module experticket-server-client
 * @description Server-side Experticket API client for communicating directly with the Experticket external API.
 *
 * @remarks
 * This module should ONLY be imported from API route handlers or server-side functions.
 * It uses environment variables for configuration and handles authentication, timeouts, and retries.
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
export interface FetchOptions {
  /** HTTP method to use. Defaults to "GET". */
  method?: "GET" | "POST" | "DELETE"
  /** Request body for POST or DELETE requests. Can be an object or string. */
  body?: unknown
  /** Query parameters to be appended to the URL. Values are automatically encoded. */
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
 * @param options - Configuration for the request.
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
  const {
    method = "GET",
    body,
    params = {},
    timeout = DEFAULT_FETCH_TIMEOUT,
    retries = DEFAULT_FETCH_RETRIES,
  } = options

  const url = buildUrl(path, params)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const fetchOptions = prepareFetchOptions(method, body, controller.signal)
    return await executeFetchWithRetry<T>(url.toString(), fetchOptions, retries)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Builds a full URL with query parameters from a path and params object.
 */
function buildUrl(path: string, params: Record<string, unknown>): URL {
  const url = new URL(path, BASE_URL)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

/**
 * Prepares the RequestInit options for the fetch call.
 */
function prepareFetchOptions(
  method: string,
  body: unknown,
  signal: AbortSignal
): RequestInit {
  const options: RequestInit = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    signal,
    cache: "no-store",
  }

  if (body && (method === "POST" || method === "DELETE")) {
    options.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  return options
}

/**
 * Executes a fetch request with optional retry logic for GET requests.
 */
async function executeFetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number
): Promise<T> {
  let lastError: unknown
  const maxAttempts = 1 + (options.method === "GET" ? retries : 0)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options)
      return await processResponse<T>(response)
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts - 1) {
        await backoff(attempt)
      }
    }
  }

  throw lastError
}

/**
 * Processes the fetch response, handling errors and parsing JSON.
 */
async function processResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "No error body")
    throw new Error(`Experticket API error ${response.status}: ${errorBody}`)
  }
  return (await response.json()) as T
}

/**
 * Simple exponential backoff helper.
 */
async function backoff(attempt: number): Promise<void> {
  const delay = 500 * (attempt + 1)
  return new Promise((resolve) => setTimeout(resolve, delay))
}
