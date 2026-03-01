/**
 * @module experticket-utils
 * @description Shared utility functions for Experticket data processing.
 */

import type { Transaction } from "./types"

/**
 * Extracts a unique transaction or sale identifier from a transaction object.
 * Checks multiple common keys used by the Experticket API.
 *
 * @param transaction - The transaction object.
 * @returns The extracted ID string, or "N/A" if not found.
 * @example
 * ```typescript
 * const id = resolveTransactionId(tx);
 * ```
 */
export function resolveTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId ?? transaction.TransactionId ?? transaction.Id
  return id !== undefined && id !== null ? String(id) : "N/A"
}

/**
 * Formats a price or amount with a currency symbol.
 *
 * @param amount - The numeric amount to format.
 * @param currency - The currency code (defaults to "EUR").
 * @returns A formatted currency string (e.g., "123.45 EUR").
 * @example
 * ```typescript
 * const price = formatPrice(123.45, "USD");
 * ```
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency: string = "EUR"
): string {
  if (amount === undefined || amount === null || amount === "") {
    return "N/A"
  }

  const numericAmount = Number(amount)
  if (isNaN(numericAmount)) {
    return "N/A"
  }

  return `${numericAmount.toFixed(2)} ${currency}`
}

/**
 * Normalizes an API response into a consistent array of T.
 *
 * @param response - The raw API response.
 * @param listKeys - Optional key(s) to look for if the response is an object.
 * @returns An array of entities.
 * @example
 * ```typescript
 * const transactions = normalizeApiResponse<Transaction>(data, 'Transactions');
 * ```
 */
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: unknown,
  listKeys?: string | string[]
): T[] {
  if (!isValidObject(response)) return []

  if (Array.isArray(response)) return response as T[]

  const resp = response as Record<string, unknown>
  if (resp.Success === false) return []

  return (
    extractListFromObject<T>(resp, listKeys) ??
    extractFromFallbacks<T>(resp) ??
    wrapAsArrayIfValid<T>(resp)
  )
}

/**
 * Checks if the value is a non-null object.
 */
function isValidObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null
}

/**
 * Extracts a list from the response object using provided keys.
 */
function extractListFromObject<T>(
  resp: Record<string, unknown>,
  listKeys?: string | string[]
): T[] | undefined {
  if (!listKeys) return undefined

  const keys = Array.isArray(listKeys) ? listKeys : [listKeys]
  for (const key of keys) {
    if (Array.isArray(resp[key])) {
      return resp[key] as T[]
    }
  }
  return undefined
}

/**
 * Extracts a list from the response object using common fallback keys.
 */
function extractFromFallbacks<T>(resp: Record<string, unknown>): T[] | undefined {
  const fallbacks = ["Transactions", "Documents", "AccessCodes", "Codes", "CancellationRequests"]
  for (const key of fallbacks) {
    if (Array.isArray(resp[key])) {
      return resp[key] as T[]
    }
  }
  return undefined
}

/**
 * Wraps a single object as an array if it's not a container object.
 */
function wrapAsArrayIfValid<T>(resp: Record<string, unknown>): T[] {
  const isContainer = "Success" in resp || "Timestamp" in resp
  return !isContainer ? [resp as unknown as T] : []
}
