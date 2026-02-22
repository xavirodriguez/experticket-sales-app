/**
 * @module lib/utils
 * @description Utility functions for the application.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple Tailwind CSS classes and merges conflicting ones.
 *
 * @param inputs - A list of class values to be combined.
 * @returns A string containing the merged Tailwind CSS classes.
 *
 * @example
 * ```typescript
 * const className = cn('px-2 py-1', 'bg-blue-500', { 'text-white': true });
 * // returns 'px-2 py-1 bg-blue-500 text-white'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
