/**
 * @module ErrorAlert
 * @description A reusable error alert component using Radix UI primitives and Lucide icons.
 */

"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

/**
 * Defines the properties for the {@link ErrorAlert} component.
 */
export interface ErrorAlertProps {
  /** The error message string to be displayed within the alert. */
  message: string
  /** Optional CSS class names to be applied to the alert container. */
  className?: string
}

/**
 * Renders a standardized error alert box with a destructive style.
 *
 * @remarks
 * This component uses the `AlertCircle` icon from Lucide and the Radix-based
 * Alert primitive from the UI library.
 *
 * @param props - The component properties.
 * @returns A JSX element representing the error alert.
 *
 * @example
 * ```tsx
 * <ErrorAlert message="Failed to load catalog. Please try again." />
 * ```
 */
export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
