/**
 * Centralized constants for the Experticket integration.
 *
 * @remarks
 * This module contains configuration defaults and storage keys used
 * throughout the Experticket integration.
 *
 * @packageDocumentation
 */

/**
 * Default timeout for Experticket API requests in milliseconds.
 * @defaultValue 15000
 */
export const DEFAULT_FETCH_TIMEOUT = 15000

/**
 * Default number of retry attempts for idempotent GET requests.
 * @defaultValue 1
 */
export const DEFAULT_FETCH_RETRIES = 1

/**
 * Default reason code used when initiating a cancellation.
 * @defaultValue 0
 */
export const DEFAULT_CANCELLATION_REASON = 0

/**
 * Default currency code used for price formatting.
 * @defaultValue "EUR"
 */
export const DEFAULT_CURRENCY = "EUR"

/**
 * Centralized keys used for storing application state in localStorage.
 */
export const STORAGE_KEYS = {
  /** Key for storing whether the application is in test mode. */
  IS_TEST_MODE: "experticket_is_test",
} as const
