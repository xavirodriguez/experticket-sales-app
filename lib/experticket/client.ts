// Client-side helpers to call our /api/experticket proxy routes

/** Simple SWR-compatible fetcher */
export const fetcher = (url: string) => fetch(url).then((r) => r.json())

/** Make an API call and return the parsed JSON */
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
