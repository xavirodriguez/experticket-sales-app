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
export function getTransactionId(transaction: Transaction | Record<string, unknown>): string {
  const id = transaction.SaleId || transaction.TransactionId || transaction.Id
  return id ? String(id) : "N/A"
}

/**
 * Formats a transaction price or amount with a currency symbol.
 *
 * @param transaction - The transaction object containing price fields.
 * @returns A formatted currency string (e.g., "123.45 EUR").
 */
export function formatCurrency(transaction: Transaction | Record<string, unknown>): string {
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
 * @param listKey - The key to look for if the response is an object (e.g., "Transactions").
 * @returns An array of entities.
 */
export function normalizeApiResponse<T = Record<string, unknown>>(
  response: any,
  listKey?: string
): T[] {
  if (!response) return []

  // Ensure we're not treating an error response as a data list
  if (response.Success === false) return []

  if (Array.isArray(response)) return response as T[]

  if (listKey && response[listKey] && Array.isArray(response[listKey])) {
    return response[listKey] as T[]
  }

  // Common fallbacks if no listKey provided
  const fallbacks = ["Transactions", "Documents", "AccessCodes", "Codes", "CancellationRequests"]
  for (const key of fallbacks) {
    if (response[key] && Array.isArray(response[key])) {
      return response[key] as T[]
    }
  }

  // If it's a single object that's not the container, wrap it
  if (typeof response === "object" && response !== null && response.Success !== false) {
    return [response] as T[]
  }

  return []
}
