/**
 * Centralized utility for interacting with localStorage.
 *
 * @remarks
 * All functions in this module are safe to call in server-side environments;
 * they will gracefully handle the absence of the `window` or `localStorage` objects.
 *
 * @packageDocumentation
 */

import { STORAGE_KEYS } from "./constants"

/**
 * Checks if the application is currently running in test mode.
 *
 * @returns `true` if test mode is enabled in localStorage; `false` otherwise.
 */
export function getIsTestMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.IS_TEST_MODE) === "true"
}

/**
 * Persists the test mode setting in the browser's storage.
 *
 * @param enabled - Whether to enable or disable test mode.
 */
export function setIsTestMode(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.IS_TEST_MODE, String(enabled))
}

/**
 * Retrieves and optionally parses a generic item from localStorage.
 *
 * @param key - The unique storage key to look up.
 * @param defaultValue - The value to return if the key is not found.
 * @returns The retrieved value cast to type T, or the default value.
 *
 * @example
 * ```typescript
 * const settings = getStorageItem('user_prefs', { theme: 'light' });
 * ```
 */
export function getStorageItem<T = string>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  const item = localStorage.getItem(key)
  if (item === null) return defaultValue
  try {
    return JSON.parse(item) as T
  } catch {
    return item as unknown as T
  }
}

/**
 * Serializes and stores a generic item in localStorage.
 *
 * @param key - The unique storage key to use.
 * @param value - The value to store. Objects will be stringified to JSON.
 */
export function setStorageItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  const stringValue = typeof value === "string" ? value : JSON.stringify(value)
  localStorage.setItem(key, stringValue)
}
