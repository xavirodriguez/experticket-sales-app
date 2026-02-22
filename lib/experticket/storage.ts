/**
 * @module experticket-storage
 * @description Centralized utility for interacting with localStorage.
 */

import { STORAGE_KEYS } from "./constants"

/**
 * Checks if the application is running in test mode.
 *
 * @returns True if test mode is enabled, false otherwise.
 */
export function getIsTestMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(STORAGE_KEYS.IS_TEST_MODE) === "true"
}

/**
 * Enables or disables test mode.
 *
 * @param enabled - Whether to enable test mode.
 */
export function setIsTestMode(enabled: boolean): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.IS_TEST_MODE, String(enabled))
}

/**
 * Retrieves a generic item from localStorage.
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
 * Sets a generic item in localStorage.
 */
export function setStorageItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  const stringValue = typeof value === "string" ? value : JSON.stringify(value)
  localStorage.setItem(key, stringValue)
}
