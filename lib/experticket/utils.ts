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
 */
export function getTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId || transaction.TransactionId || transaction.Id
  return id ? String(id) : "N/A"
}

/**
 * Formats a transaction price or amount with a currency symbol.
 *
 * @param transaction - The transaction object containing price fields.
 * @returns A formatted currency string (e.g., "123.45 EUR").
 */
export function formatCurrency(transaction: Transaction): string {
  const price = transaction.TotalPrice ?? transaction.TotalAmount ?? transaction.Price
  const currency = (transaction.Currency as string) || "EUR"

  if (price === undefined || price === null) {
    return "N/A"
  }

  return `${Number(price).toFixed(2)} ${currency}`
}

/**
 * Normalizes an API response that might contain a single object, an array,
 * or an object with a named array property into a consistent array of T.
 *
 * @param response - The raw API response.
 * @param listKeys - The key(s) to look for if the response is an object.
 * @returns An array of entities.
 *
 * @example
 * ```typescript
 * const transactions = normalizeApiResponse<Transaction>(data, 'Transactions');
 * ```
 */
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: unknown,
  listKeys?: string | string[]
): T[] {
  if (!response || typeof response !== "object") return []

  const resp = response as Record<string, unknown>

  // Ensure we're not treating an error response as a data list
  if (resp.Success === false) return []

  if (Array.isArray(response)) return response as T[]

  // Check provided keys
  if (listKeys) {
    const keys = Array.isArray(listKeys) ? listKeys : [listKeys]
    for (const key of keys) {
      if (Array.isArray(resp[key])) {
        return resp[key] as T[]
      }
    }
  }

  // Common fallbacks if no listKeys provided or not found
  const fallbacks = ["Transactions", "Documents", "AccessCodes", "Codes", "CancellationRequests"]
  for (const key of fallbacks) {
    if (Array.isArray(resp[key])) {
      return resp[key] as T[]
    }
  }

  // If it's a single object that's not the container, wrap it
  // We check for some common properties of the container to avoid wrapping it
  const isContainer = "Success" in resp || "Timestamp" in resp
  if (!isContainer) {
    return [response as T]
  }

  return []
}
