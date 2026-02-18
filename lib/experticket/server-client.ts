// Server-side Experticket API client
// This module should ONLY be imported from API route handlers (server-side)

const BASE_URL = process.env.EXPERTICKET_BASE_URL || ""
const PARTNER_ID = process.env.EXPERTICKET_PARTNER_ID || ""
const API_KEY = process.env.EXPERTICKET_API_KEY || ""
const DEFAULT_LANG = process.env.EXPERTICKET_DEFAULT_LANGUAGE || "en"

export function getPartnerId() {
  return PARTNER_ID
}

export function getDefaultLanguage() {
  return DEFAULT_LANG
}

export function getEncodedApiKey() {
  return encodeURIComponent(API_KEY)
}

export function getRawApiKey() {
  return API_KEY
}

interface FetchOptions {
  method?: "GET" | "POST" | "DELETE"
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
  retries?: number
}

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
