/**
 * @module Constants
 * @description Centralized constants for the application to avoid magic numbers and strings.
 */

export const EXPERTICKET_CONFIG = {
  /** Default timeout for API requests in milliseconds. */
  DEFAULT_TIMEOUT: 15000,
  /** Default number of retry attempts for idempotent GET requests. */
  DEFAULT_RETRIES: 1,
  /** Default page size for paginated API results. */
  DEFAULT_PAGE_SIZE: 20,
  /** Default language code. */
  DEFAULT_LANGUAGE: "en",
} as const

export const LOCAL_STORAGE_KEYS = {
  /** Key for storing the test mode flag. */
  IS_TEST: "experticket_is_test",
} as const

export const CANCELLATION_REASONS = {
  /** Default cancellation reason code. */
  DEFAULT: 0,
} as const

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const
