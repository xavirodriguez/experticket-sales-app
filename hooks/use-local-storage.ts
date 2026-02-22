/**
 * @module useLocalStorage
 * @description A custom hook for managing state synchronized with localStorage.
 */

"use client"

import { useState, useCallback, useEffect } from "react"

/**
 * Hook to manage a value in localStorage.
 *
 * @param key - The key under which the value is stored.
 * @param initialValue - The fallback value if none is found in localStorage.
 * @returns A tuple containing the stored value and a setter function.
 *
 * @example
 * ```tsx
 * const [isTest, setIsTest] = useLocalStorage('experticket_is_test', false);
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Get initial value from localStorage if available, otherwise use initialValue
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [initialValue, key])

  const [storedValue, setStoredValue] = useState<T>(readValue)

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  useEffect(() => {
    setStoredValue(readValue())
  }, [readValue])

  return [storedValue, setValue]
}
