/**
 * Client-side helpers for calling internal Experticket proxy API routes.
 *
 * @remarks
 * These utilities are designed for use in React components and hooks (client-side).
 * They communicate with the application's own API routes which then proxy requests
 * to the Experticket backend.
 *
 * @packageDocumentation
 */

/**
 * Fetches data from an internal API route; designed for use with the SWR library.
 *
 * @param url - Internal application API URL to fetch data from.
 * @returns A promise that resolves to the parsed JSON response.
 *
 * @throws Error
 * Thrown if the fetch fails or the response status is not OK.
 *
 * @example
 * ```typescript
 * const { data, error } = useSWR('/api/experticket/catalog', fetcher);
 * ```
 */
/**
 * Generic fetcher for SWR with standard error handling.
 *
 * @param url - The URL to fetch.
 * @returns A promise resolving to the parsed JSON response.
 */
export async function swrFetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    try {
      const errorBody = JSON.parse(text)
      const message =
        errorBody.errorMessage || errorBody.message || `HTTP ${res.status}: ${url} -> ${text}`
      throw new Error(message)
    } catch {
      throw new Error(`HTTP ${res.status}: ${url} -> ${text}`)
    }
  }
  return res.json()
}

/** Legacy alias for backward compatibility. */
export const fetcher = swrFetcher

/**
 * Performs a fetch request to an internal API route.
 *
 * @remarks
 * This function automatically sets the `Content-Type` header to `application/json`.
 * It is a thin wrapper around the native `fetch` API for consistent internal calls.
 *
 * @param path - Internal API endpoint path.
 * @param options - Standard RequestInit options for the fetch call.
 * @returns Fetch Response object.
 *
 * @example
 * ```typescript
 * const res = await apiFetch('/api/experticket/cancellation', {
 *   method: 'POST',
 *   body: JSON.stringify({ saleId: '123' })
 * });
 * ```
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(path, {
    ...options,
    headers,
  })
  return res
}
