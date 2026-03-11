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
 * Data fetcher compatible with the SWR library.
 *
 * @param url - Internal API URL to fetch data from.
 * @returns Parsed JSON response.
 *
 * @example
 * ```typescript
 * const { data, error } = useSWR('/api/experticket/catalog', fetcher);
 * ```
 */
export const fetcher = (url: string): Promise<any> =>
  fetch(url).then(async (res) => {
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${url} -> ${text}`)
    }
    return res.json()
  })

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
