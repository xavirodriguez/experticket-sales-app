/**
 * Shared utility functions for Experticket data processing.
 *
 * @remarks
 * This module contains functions for price formatting, ID resolution,
 * and API response normalization.
 *
 * @packageDocumentation
 */

import type { Transaction } from "./types"

/**
 * Extracts a unique transaction or sale identifier from a transaction object.
 *
 * @remarks
 * This function checks multiple common keys (`SaleId`, `TransactionId`, `Id`) used by
 * different Experticket API endpoints to ensure a valid identifier is resolved.
 *
 * @param transaction - Transaction object to extract the ID from.
 * @returns Extracted identifier string, or "N/A" if no valid identifier is found.
 *
 * @example
 * ```typescript
 * const id = resolveTransactionId({ SaleId: "12345" });
 * // returns "12345"
 * ```
 */
export function resolveTransactionId(transaction: Transaction): string {
  const id = transaction.SaleId ?? transaction.TransactionId ?? transaction.Id
  return id !== undefined && id !== null ? String(id) : "N/A"
}

/**
 * Formats a numeric price or amount into a human-readable currency string.
 *
 * @remarks
 * If the provided amount is null, undefined, or empty, the function returns "N/A".
 * It handles both numeric and stringified numbers.
 *
 * @param amount - Numeric or string amount to format.
 * @param currency - ISO currency code to append.
 * @returns Formatted string containing the amount with two decimal places and the currency.
 *
 * @example
 * ```typescript
 * const price = formatPrice(123.456, "USD");
 * // returns "123.46 USD"
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
 * Normalizes an inconsistent API response into a standard array of entities.
 *
 * @remarks
 * The Experticket API may return lists directly as arrays or wrapped within objects
 * under various keys. This function attempts to find the list based on common
 * patterns and provided keys.
 *
 * @param response - Raw, unknown API response to normalize.
 * @param listKeys - Optional key or list of keys to prioritize when searching for the array.
 * @returns Typed array containing the normalized entities.
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
  if (!isValidObject(response)) return []

  if (Array.isArray(response)) return response as T[]

  const responseObject = response as Record<string, unknown>
  if (responseObject.Success === false) return []

  return (
    extractListFromObject<T>(responseObject, listKeys) ??
    extractFromFallbacks<T>(responseObject) ??
    wrapAsArrayIfValid<T>(responseObject)
  )
}

/**
 * Checks whether a given value is a non-null object.
 *
 * @param val - Value to check.
 * @returns `true` if the value is an object and not null.
 *
 * @internal
 */
export function isValidObject(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null
}

/**
 * Attempts to extract a list of entities from a response object using specific keys.
 *
 * @param responseObject - The object to search within.
 * @param listKeys - Key or keys to check for an array.
 * @returns The found array, or `undefined` if no array was found.
 *
 * @internal
 */
export function extractListFromObject<T>(
  responseObject: Record<string, unknown>,
  listKeys?: string | string[]
): T[] | undefined {
  if (!listKeys) return undefined

  const keys = Array.isArray(listKeys) ? listKeys : [listKeys]
  for (const key of keys) {
    if (Array.isArray(responseObject[key])) {
      return responseObject[key] as T[]
    }
  }
  return undefined
}

/**
 * Attempts to extract a list of entities from a response object using common fallback keys.
 *
 * @param responseObject - The object to search within.
 * @returns The found array, or `undefined` if no fallback key contained an array.
 *
 * @internal
 */
export function extractFromFallbacks<T>(
  responseObject: Record<string, unknown>
): T[] | undefined {
  const fallbacks = ["Transactions", "Documents", "AccessCodes", "Codes", "CancellationRequests"]
  for (const key of fallbacks) {
    if (Array.isArray(responseObject[key])) {
      return responseObject[key] as T[]
    }
  }
  return undefined
}

/**
 * Wraps the provided object into an array if it represents a single domain entity.
 *
 * @remarks
 * This function avoids wrapping "container" objects that only hold metadata
 * like `Success` or `Timestamp`.
 *
 * @param responseObject - The object to evaluate.
 * @returns An array containing the object, or an empty array if it's a container.
 *
 * @internal
 */
export function wrapAsArrayIfValid<T>(responseObject: Record<string, unknown>): T[] {
  const isContainer = "Success" in responseObject || "Timestamp" in responseObject
  return !isContainer ? [responseObject as unknown as T] : []
}
