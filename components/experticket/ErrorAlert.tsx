/**
 * @module ErrorAlert
 * @description A reusable error alert component using Radix UI primitives and Lucide icons.
 */

"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

/**
 * Props for the {@link ErrorAlert} component.
 */
interface ErrorAlertProps {
  /** The error message to display. */
  message: string
  /** Additional CSS classes for the alert container. */
  className?: string
}

/**
 * ErrorAlert component for displaying error messages in a consistent style.
 *
 * @param props - {@link ErrorAlertProps}
 */
export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
