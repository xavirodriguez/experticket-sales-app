/**
 * @module ThemeProvider
 * @description Provides theme management (light/dark mode) to the application using `next-themes`.
 */

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * A wrapper component that enables theme switching capabilities.
 *
 * @param props - Standard `next-themes` ThemeProviderProps.
 *
 * @example
 * ```tsx
 * // In your root layout:
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
