/**
 * @module experticket-utils
 * @description Shared utility functions for Experticket data processing and normalization.
 */

import type { Transaction } from "./types"

/**
 * Resolves a unique identifier for a transaction or sale.
 * Iterates through common Experticket API identifier keys (SaleId, TransactionId, Id).
 *
 * @param transaction - The transaction-like object to resolve the ID from.
 * @returns The resolved identifier as a string, or "N/A" if no identifier is found.
 *
 * @example
 * ```typescript
 * const id = resolveTransactionId(transaction);
 * ```
 */
export function resolveTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId || transaction.TransactionId || transaction.Id
  return id ? String(id) : "N/A"
}

/**
 * Formats a numeric price into a human-readable currency string.
 *
 * @param amount - The numeric price amount. If undefined or null, returns "N/A".
 * @param currency - The currency symbol or code (defaults to "EUR").
 * @returns A formatted currency string (e.g., "123.45 EUR").
 *
 * @example
 * ```typescript
 * const price = formatPrice(123.456, "USD"); // "123.46 USD"
 * ```
 */
export function formatPrice(
  amount: number | undefined | null,
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
 * @param listKeys - Optional key or list of keys to look for in the response object.
 * @returns A guaranteed array of entities of type T. Returns an empty array if normalization fails.
 *
 * @example
 * ```typescript
 * const transactions = normalizeApiResponse<Transaction>(data, 'Transactions');
 * ```
 */
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: unknown,
  listKeys?: string | string[]
): readonly T[] {
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

  // Check provided keys
  if (listKeys) {
    const keys = Array.isArray(listKeys) ? listKeys : [listKeys]
    for (const key of keys) {
      const value = resp[key]
      if (Array.isArray(value)) {
        return value as T[]
      }
    }
  }

  // Common fallbacks if no listKeys provided or not found
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

  // If it's a single object that's not the container, wrap it
  // We check for some common properties of the container to avoid wrapping it
  const isContainer = "Success" in resp || "Timestamp" in resp
  if (!isContainer) {
    return [response as T]
  }

  return []
}
