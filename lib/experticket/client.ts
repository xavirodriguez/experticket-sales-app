/**
 * @module experticket-client
 * @description Client-side helpers for calling internal Experticket proxy API routes.
 */

/**
 * A simple fetcher compatible with the SWR library for data fetching.
 *
 * @param url - The internal API URL to fetch data from.
 * @returns A promise that resolves to the parsed JSON response.
 *
 * @example
 * ```typescript
 * const { data, error } = useSWR('/api/experticket/catalog', fetcher);
 * ```
 */
export const fetcher = (url: string) => fetch(url).then((r) => r.json())

/**
 * Performs a fetch request to an internal API route and returns the raw Response.
 *
 * @remarks
 * This function automatically sets the `Content-Type` header to `application/json`.
 * It is a thin wrapper around the native `fetch` API for consistent internal calls.
 *
 * @param path - The internal API endpoint path.
 * @param options - Standard RequestInit options for the fetch call.
 * @returns A promise that resolves to the fetch Response object.
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
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  return res
}
