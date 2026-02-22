/**
 * @module experticket-constants
 * @description Centralized constants for the Experticket integration.
 */

/**
 * Default timeout for Experticket API requests in milliseconds.
 */
export const DEFAULT_FETCH_TIMEOUT = 15000

/**
 * Default number of retry attempts for idempotent GET requests.
 */
export const DEFAULT_FETCH_RETRIES = 1

/**
 * Default reason code for cancellations.
 */
export const DEFAULT_CANCELLATION_REASON = 0

/**
 * Default currency code.
 */
export const DEFAULT_CURRENCY = "EUR"

/**
 * LocalStorage keys.
 */
export const STORAGE_KEYS = {
  IS_TEST_MODE: "experticket_is_test",
} as const
