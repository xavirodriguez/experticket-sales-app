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

const BASE_URL = process.env.EXPERTICKET_BASE_URL || "https://api.experticket.com"
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

  /**
   * Initializes a new instance of the {@link ExperticketError} class.
   *
   * @param message - Error message.
   * @param status - HTTP status code.
   * @param details - Raw response body or additional details.
   */
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
    /** Seconds between revalidations or `false` to disable. */
    revalidate?: number | false
    /** Cache tags for on-demand revalidation. */
    tags?: string[]
  }
}

/**
 * Retrieves the Experticket API Version from the environment configuration.
 *
 * @returns The configured API version string (e.g., "3.58").
 */
export function getApiVersion(): string {
  return API_VERSION
}

/**
 * Retrieves the Experticket Partner ID from the environment configuration.
 *
 * @returns The configured Partner ID.
 */
export function getPartnerId(): string {
  return PARTNER_ID
}

/**
 * Retrieves the default ISO language code from the environment configuration.
 *
 * @returns The default language code (e.g., "en").
 */
export function getDefaultLanguage(): string {
  return DEFAULT_LANG
}

/**
 * Retrieves the Experticket API Key from the environment configuration.
 *
 * @returns The configured API Key.
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
  params?: Record<string, string | number | boolean | string[] | undefined>
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
 * @param path - API endpoint path relative to the base URL.
 * @param options - Configuration for the request.
 * @returns Parsed JSON response of type T.
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
  const method = options.method || "GET"
  const url = buildRequestUrl(path, options.params || {}, method)
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
 *
 * @internal
 */
export interface ExecuteRequestOptions {
  /** Full URL for the request. */
  url: string
  /** Fetch configuration. */
  options: NextFetchRequestInit
  /** Timeout in milliseconds. */
  timeout: number
  /** Number of retries. */
  retries: number
}

/**
 * Options for performing a fetch with retry logic.
 *
 * @internal
 */
export interface RetryOptions {
  /** Full URL for the request. */
  url: string
  /** Fetch configuration. */
  options: NextFetchRequestInit
  /** Number of retry attempts. */
  retries: number
}

/**
 * Builds a full Experticket API URL with normalized path and query parameters.
 *
 * @param path - API endpoint path.
 * @param params - Query parameters to append.
 * @param method - HTTP method of the request.
 * @returns A constructed {@link URL} object.
 *
 * @internal
 */
function buildRequestUrl(path: string, params: Record<string, unknown>, method: string): URL {
  const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  const url = new URL(`${normalizedBase}/${normalizedPath}`)

  const mergedParams = mergeDefaultParams(params)
  const allParams = applyCredentials(mergedParams, method)

  appendUrlSearchParams(url, allParams)

  return url
}

/**
 * Appends credentials to query string for GET requests if not provided.
 *
 * @internal
 */
function applyCredentials(params: Record<string, unknown>, method: string): Record<string, unknown> {
  const allParams = { ...params }

  if (method === "GET") {
    if (!allParams.PartnerId && PARTNER_ID) {
      allParams.PartnerId = PARTNER_ID
    }
    if (!allParams.ApiKey && API_KEY) {
      allParams.ApiKey = API_KEY
    }
  }

  return allParams
}

/**
 * Merges default parameters with provided ones.
 *
 * @internal
 */
function mergeDefaultParams(params: Record<string, unknown>): Record<string, unknown> {
  return {
    "api-version": API_VERSION,
    ...params,
  }
}

/**
 * Appends normalized query parameters to a URL object.
 *
 * @param url - URL object to modify.
 * @param params - Parameters to append.
 *
 * @internal
 */
function appendUrlSearchParams(url: URL, params: Record<string, unknown>) {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => url.searchParams.append(key, String(v)))
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  })
}

/**
 * Constructs the base fetch configuration for an Experticket API call.
 *
 * @param options - High-level fetch options.
 * @returns Normalized {@link NextFetchRequestInit} object.
 *
 * @internal
 */
function prepareFetchOptions(options: FetchOptions): NextFetchRequestInit {
  const { method = "GET", body, revalidate = 60 } = options
  const correlationId = crypto.randomUUID()

  const fetchOptions: NextFetchRequestInit = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-correlation-id": correlationId,
    },
  }

  applyCachingStrategy(fetchOptions, method, revalidate)
  applyRequestBody(fetchOptions, method, body)

  return fetchOptions
}

/**
 * Configures the Next.js caching behavior based on the request method.
 *
 * @param options - Fetch options to modify.
 * @param method - HTTP method.
 * @param revalidate - Cache revalidation interval in seconds.
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
 * Serializes and attaches a request body for state-changing operations.
 *
 * @param options - Fetch options to modify.
 * @param method - HTTP method.
 * @param body - Raw body data.
 *
 * @internal
 */
function applyRequestBody(options: NextFetchRequestInit, method: string, body: unknown) {
  const isPostOrDelete = method === "POST" || method === "DELETE"

  if (body && isPostOrDelete) {
    options.body = typeof body === "string" ? body : JSON.stringify(body)
  }
}

/**
 * Wraps a fetch request with an AbortController for timeout management.
 *
 * @param requestOptions - Execution configuration.
 * @returns Parsed JSON response.
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
 * Orchestrates multiple fetch attempts with exponential backoff for GET requests.
 *
 * @param retryOptions - Retry configuration.
 * @returns Parsed JSON response.
 *
 * @internal
 */
async function performFetchWithRetry<T>({
  url,
  options,
  retries,
}: RetryOptions): Promise<T> {
  const maxAttempts = options.method === "GET" ? 1 + retries : 1

  return await executeAttempts<T>(url, options, maxAttempts)
}

// Circuit Breaker State
const CIRCUIT_BREAKER = {
  failureCount: 0,
  lastFailureTime: 0,
  threshold: 5,
  cooldown: 30000, // 30 seconds
}

/**
 * Recursively executes fetch attempts until success or max attempts reached.
 *
 * @internal
 */
// Rate Limiter State (In-memory, single node only)
const RATE_LIMITER = {
  requests: new Map<string, number[]>(),
  limit: 100, // requests per minute
  window: 60000,
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const timestamps = RATE_LIMITER.requests.get(key) || []
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMITER.window)
  if (validTimestamps.length >= RATE_LIMITER.limit) return false
  validTimestamps.push(now)
  RATE_LIMITER.requests.set(key, validTimestamps)
  return true
}

async function executeAttempts<T>(
  url: string,
  options: NextFetchRequestInit,
  maxAttempts: number,
  currentAttempt: number = 1
): Promise<T> {
  // Simple Rate Limiter Check (per endpoint for this server instance)
  const endpoint = new URL(url).pathname
  if (!checkRateLimit(endpoint)) {
    throw new ExperticketError("Too many requests to this endpoint. Please wait.", 429)
  }

  // Simple Circuit Breaker Check
  if (
    CIRCUIT_BREAKER.failureCount >= CIRCUIT_BREAKER.threshold &&
    Date.now() - CIRCUIT_BREAKER.lastFailureTime < CIRCUIT_BREAKER.cooldown
  ) {
    throw new ExperticketError("Circuit breaker is open. Upstream service is currently unavailable.", 503)
  }

  try {
    const response = await fetch(url, options)
    const result = await handleApiResponse<T>(response)

    // On success, reset circuit breaker
    CIRCUIT_BREAKER.failureCount = 0
    return result
  } catch (error) {
    // Record failure for circuit breaker
    CIRCUIT_BREAKER.failureCount++
    CIRCUIT_BREAKER.lastFailureTime = Date.now()

    if (currentAttempt >= maxAttempts) {
      throw error
    }
    await delay(500 * currentAttempt)
    return await executeAttempts<T>(url, options, maxAttempts, currentAttempt + 1)
  }
}

/**
 * Validates the HTTP status and parses the body of an API response.
 *
 * @param response - Native fetch Response object.
 * @returns Parsed JSON content of type T.
 *
 * @throws {@link ExperticketError}
 * Thrown if the response status is not successful.
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
 * Safely attempts to parse a JSON string without throwing.
 *
 * @param text - Raw string content to parse.
 * @returns Parsed object or an empty object `{}` on failure.
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
 * Constructs a detailed {@link ExperticketError} from an unsuccessful API response.
 *
 * @param response - Failed fetch Response object.
 * @param data - Parsed JSON error details (if any).
 * @param text - Raw response body string.
 * @returns A structured error object.
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
 * Pauses execution for a specified duration.
 *
 * @param ms - Milliseconds to sleep.
 * @returns A promise that resolves after the delay.
 *
 * @internal
 */
function delay(ms: number): Promise<void> {
  const executor = (resolve: () => void) => setTimeout(resolve, ms)
  return new Promise<void>(executor)
}
