/**
 * @module ErrorAlert
 * @description A shared error alert component using Radix UI primitives.
 */

import React from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Props for the {@link ErrorAlert} component.
 */
interface ErrorAlertProps {
  /** The error message to display. */
  message: string
}

/**
 * Renders a standardized error alert.
 *
 * @param props - Component props.
 * @returns The rendered error alert.
 */
export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
