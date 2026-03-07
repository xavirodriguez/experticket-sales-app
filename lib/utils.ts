/**
 * @module lib/utils
 * @description Core application utility functions.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple Tailwind CSS class values and merges conflicting utilities.
 *
 * @remarks
 * This function uses `clsx` to conditionally join class names and `tailwind-merge`
 * to ensure that later classes in the list override earlier conflicting ones.
 *
 * @param inputs - A variadic list of class values (strings, objects, arrays, etc.).
 * @returns A single string of merged Tailwind CSS classes.
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
