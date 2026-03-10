/**
 * Server-side Experticket API client.
 *
 * @remarks
 * This module should ONLY be imported from API route handlers or server-side functions.
 * It uses environment variables for configuration.
 *
 * @packageDocumentation
 */

import { DEFAULT_FETCH_TIMEOUT, DEFAULT_FETCH_RETRIES } from "./constants"

const BASE_URL = process.env.EXPERTICKET_BASE_URL || ""
const PARTNER_ID = process.env.EXPERTICKET_PARTNER_ID || ""
const API_KEY = process.env.EXPERTICKET_API_KEY || ""
const API_VERSION = process.env.EXPERTICKET_API_VERSION || "3.58"
const DEFAULT_LANG = process.env.EXPERTICKET_DEFAULT_LANGUAGE || "en"

/**
 * Custom error class for Experticket API errors.
 */
export class ExperticketError extends Error {
  /** HTTP status code from the upstream response. */
  public readonly status: number
  /** Raw response body or additional error details. */
  public readonly details?: string

  constructor(message: string, status: number, details?: string) {
    super(message)
    this.name = "ExperticketError"
    this.status = status
    this.details = details
    Object.setPrototypeOf(this, ExperticketError.prototype)
  }
}

/**
 * Extended RequestInit to include Next.js-specific properties.
 */
export interface NextFetchRequestInit extends RequestInit {
  /** Next.js specific caching and revalidation options. */
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

/**
 * Retrieves the API Version from environment variables.
 */
export function getApiVersion(): string {
  return API_VERSION
}

/**
 * Retrieves the Partner ID from environment variables.
 */
export function getPartnerId(): string {
  return PARTNER_ID
}

/**
 * Retrieves the default language code from environment variables.
 */
export function getDefaultLanguage(): string {
  return DEFAULT_LANG
}

/**
 * Retrieves the raw API Key from environment variables.
 */
export function getApiKey(): string {
  return API_KEY
}

/**
 * Configuration options for the {@link experticketFetch} function.
 */
export interface FetchOptions {
  /**
   * HTTP method to use.
   * @defaultValue "GET"
   */
  method?: "GET" | "POST" | "DELETE"
  /** Request body for POST or DELETE requests. */
  body?: unknown
  /** Query parameters to be appended to the URL. */
  params?: Record<string, string | number | boolean | undefined>
  /**
   * Timeout in milliseconds before the request is aborted.
   * @defaultValue 15000
   */
  timeout?: number
  /**
   * Number of retry attempts for idempotent GET requests.
   * @defaultValue 1
   */
  retries?: number
  /** Cache revalidation time in seconds. Defaults to 60 for GET requests. */
  revalidate?: number
}

/**
 * Performs an authenticated server-side fetch to the Experticket API.
 *
 * @remarks
 * This function handles URL building, timeouts, retries (only for GET requests),
 * and JSON parsing. It is intended for use in server-side contexts only.
 *
 * @param path - The API endpoint path relative to the base URL.
 * @param options - Configuration for the request.
 * @returns A promise that resolves to the parsed JSON response of type T.
 *
 * @throws {@link ExperticketError}
 * Thrown if the API response is not OK or if a network/timeout error occurs.
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

  return await executeRequestWithTimeout<T>({
    url: url.toString(),
    options: fetchOptions,
    timeout,
    retries,
  })
}

/**
 * Options for executing a request with timeout.
 * @internal
 */
export interface ExecuteRequestOptions {
  /** The full URL for the request. */
  url: string
  /** The fetch configuration. */
  options: NextFetchRequestInit
  /** Timeout in milliseconds. */
  timeout: number
  /** Number of retries. */
  retries: number
}

/**
 * Options for performing a fetch with retry logic.
 * @internal
 */
export interface RetryOptions {
  /** The full URL for the request. */
  url: string
  /** The fetch configuration. */
  options: NextFetchRequestInit
  /** Number of retry attempts. */
  retries: number
}

/**
 * Builds a URL with query parameters.
 *
 * @internal
 */
function buildRequestUrl(path: string, params: Record<string, unknown>): URL {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  const url = new URL(`${normalizedBase}/${normalizedPath}`)

  const allParams = mergeDefaultParams(params)
  appendUrlSearchParams(url, allParams)

  return url
}

/**
 * Merges default parameters with provided ones.
 *
 * @internal
 */
function mergeDefaultParams(params: Record<string, unknown>) {
  return {
    ApiKey: API_KEY,
    PartnerId: PARTNER_ID,
    "api-version": API_VERSION,
    ...params,
  }
}

/**
 * Appends query parameters to a URL object.
 *
 * @internal
 */
function appendUrlSearchParams(url: URL, params: Record<string, unknown>) {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value))
    }
  })
}

/**
 * Prepares the standard fetch options.
 *
 * @internal
 */
function prepareFetchOptions(options: FetchOptions): NextFetchRequestInit {
  const { method = "GET", body, revalidate = 60 } = options
  const fetchOptions: NextFetchRequestInit = {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
  }

  applyCachingStrategy(fetchOptions, method, revalidate)
  applyRequestBody(fetchOptions, method, body)

  return fetchOptions
}

/**
 * Applies caching strategy based on the HTTP method.
 *
 * @internal
 */
function applyCachingStrategy(options: NextFetchRequestInit, method: string, revalidate: number) {
  if (method === "GET") {
    options.next = { revalidate }
  } else {
    options.cache = "no-store"
  }
}

/**
 * Applies request body for POST or DELETE methods.
 *
 * @internal
 */
function applyRequestBody(options: NextFetchRequestInit, method: string, body: unknown) {
  if (body && (method === "POST" || method === "DELETE")) {
    options.body = typeof body === "string" ? body : JSON.stringify(body)
  }
}

/**
 * Executes a fetch request with a specified timeout.
 *
 * @internal
 */
async function executeRequestWithTimeout<T>({
  url,
  options,
  timeout,
  retries,
}: ExecuteRequestOptions): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const optionsWithSignal = { ...options, signal: controller.signal }
    return await performFetchWithRetry<T>({ url, options: optionsWithSignal, retries })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Performs the actual fetch with retry logic for idempotent GET requests.
 *
 * @internal
 */
async function performFetchWithRetry<T>({
  url,
  options,
  retries,
}: RetryOptions): Promise<T> {
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
 *
 * @internal
 */
async function fetchAndProcess<T>(url: string, options: NextFetchRequestInit): Promise<T> {
  const response = await fetch(url, options)
  return await handleApiResponse<T>(response)
}

/**
 * Processes the API response, ensuring it is OK and parsing JSON.
 *
 * @internal
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const data = tryParseJson(text)

  if (!response.ok) {
    throw buildUpstreamError(response, data, text)
  }

  return data as T
}

/**
 * Attempts to parse a string as JSON, returning an empty object on failure.
 *
 * @internal
 */
function tryParseJson(text: string) {
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

/**
 * Builds an Error object enriched with upstream API details.
 *
 * @internal
 */
function buildUpstreamError(response: Response, data: unknown, text: string): ExperticketError {
  const resp = data as Record<string, unknown>
  const message = String(resp?.ErrorMessage || text || "Unknown error")
  return new ExperticketError(
    `Experticket API error ${response.status}: ${message}`,
    response.status,
    text
  )
}

/**
 * Simple delay helper.
 *
 * @internal
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
