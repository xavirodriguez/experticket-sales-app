import { NextResponse } from "next/server"
import { ExperticketError } from "./server-client"

/**
 * Utility functions for Next.js API route handlers.
 *
 * @remarks
 * These utilities assist in creating standardized responses and handling
 * errors within the application's internal API proxy routes.
 *
 * @packageDocumentation
 */

/**
 * Creates a standardized error response for Experticket API routes.
 *
 * @remarks
 * This helper ensures that all internal API proxy routes return errors in a format
 * consistent with {@link ExperticketBaseResponse}, using a standard HTTP status.
 *
 * @param err - Error object or message to be returned.
 * @param fallbackStatus - HTTP status code to use if the error is not an {@link ExperticketError}.
 * @returns Next.js Response object containing the serialized error details.
 *
 * @example
 * ```typescript
 * try {
 *   // ... logic
 * } catch (error) {
 *   return createErrorResponse(error, 500);
 * }
 * ```
 */
export function createErrorResponse(
  err: unknown,
  fallbackStatus: number = 502
): NextResponse {
  const isExperticketError = err instanceof ExperticketError
  const message = err instanceof Error ? err.message : "Unknown error"
  const upstreamStatus = isExperticketError ? err.status : fallbackStatus
  const details = isExperticketError ? err.details : undefined

  logErrorInDevelopment(message, upstreamStatus, details)

  return NextResponse.json(
    {
      Success: false,
      ErrorMessage: message,
      UpstreamStatus: upstreamStatus,
      Details: details,
    },
    { status: upstreamStatus }
  )
}

/**
 * Logs API errors to the console in development mode.
 *
 * @param message - Error message to log.
 * @param status - HTTP status code.
 * @param details - Optional error details or raw response body.
 *
 * @internal
 */
function logErrorInDevelopment(message: string, status: number, details?: string) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Experticket API Error ${status}]: ${message}`)
    if (details) {
      console.error("[Details]:", details)
    }
  }
}
