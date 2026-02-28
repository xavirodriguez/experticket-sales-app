/**
 * @module experticket-utils
 * @description Shared utility functions for Experticket data processing.
 */

import type { Transaction } from "./types"

/**
 * Extracts a unique transaction or sale identifier from a transaction object.
 * Checks multiple common keys used by the Experticket API.
 *
 * @param transaction - The transaction object to extract the ID from.
 * @returns The extracted ID string, or "N/A" if no identifier is found.
 * @example
 * ```typescript
 * const id = resolveTransactionId(transaction);
 * ```
 */
export function resolveTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId ?? transaction.TransactionId ?? transaction.Id
  return id ? String(id) : "N/A"
}

/**
 * Formats a numeric price or amount with a currency symbol.
 *
 * @param amount - The numeric value to format.
 * @param currency - The currency code (e.g., "EUR", "USD"). Defaults to "EUR".
 * @returns A formatted price string (e.g., "123.45 EUR"), or "N/A" if amount is missing.
 * @example
 * ```typescript
 * const price = formatPrice(123.45, "EUR");
 * ```
 */
export function formatPrice(
  amount: number | null | undefined,
  currency: string = "EUR"
): string {
  if (amount === undefined || amount === null) {
    return "N/A"
  }

  return `${Number(amount).toFixed(2)} ${currency}`
}

/**
 * Normalizes an API response that might contain a single object, an array,
 * or an object with a named array property into a consistent array of T.
 *
 * @param response - The raw API response to normalize.
 * @param listKeys - Optional key or list of keys to look for if the response is an object.
 * @returns A guaranteed array of entities of type T.
 * @example
 * ```typescript
 * const transactions = normalizeApiResponse<Transaction>(data, 'Transactions');
 * ```
 */
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: unknown,
  listKeys?: string | string[]
): T[] {
  if (!response || typeof response !== "object") {
    return []
  }

  const resp = response as Record<string, unknown>

  // Ensure we're not treating an error response as a data list
  if (resp.Success === false) {
    return []
  }

  if (Array.isArray(response)) {
    return response as T[]
  }

  return extractListFromObject<T>(resp, listKeys)
}

/**
 * Helper to extract a list from an object based on keys or common fallbacks.
 * @internal
 */
function extractListFromObject<T>(
  resp: Record<string, unknown>,
  listKeys?: string | string[]
): T[] {
  if (listKeys) {
    const keys = Array.isArray(listKeys) ? listKeys : [listKeys]
    for (const key of keys) {
      const value = resp[key]
      if (Array.isArray(value)) {
        return value as T[]
      }
    }
  }

  return extractFromFallbacks<T>(resp)
}

/**
 * Checks common fallback keys for arrays in the API response.
 * @internal
 */
function extractFromFallbacks<T>(resp: Record<string, unknown>): T[] {
  const fallbacks = [
    "Transactions",
    "Documents",
    "AccessCodes",
    "Codes",
    "CancellationRequests",
  ]
  for (const key of fallbacks) {
    const value = resp[key]
    if (Array.isArray(value)) {
      return value as T[]
    }
  }

  return wrapAsArrayIfValid<T>(resp)
}

/**
 * Wraps a single object in an array if it's not the API response container itself.
 * @internal
 */
function wrapAsArrayIfValid<T>(resp: Record<string, unknown>): T[] {
  const isContainer = "Success" in resp || "Timestamp" in resp
  if (!isContainer) {
    return [resp as unknown as T]
  }

  return []
}
