/**
 * @module Sonner
 * @description A wrapper around the `sonner` library for displaying toast notifications.
 */

'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

/**
 * Toaster component for displaying notifications.
 *
 * @param props - `sonner` ToasterProps.
 *
 * @example
 * ```tsx
 * // In your root layout:
 * <Toaster />
 * ```
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
