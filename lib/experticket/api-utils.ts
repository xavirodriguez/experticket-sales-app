import { NextResponse } from "next/server"

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
 * @param err - The error object or message to be returned.
 * @param status - The HTTP status code (defaults to 502 Bad Gateway).
 * @returns A {@link NextResponse} object containing the serialized error details.
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
export function createErrorResponse(err: unknown, status: number = 502): NextResponse {
  const message = err instanceof Error ? err.message : "Unknown error"
  return NextResponse.json(
    {
      Success: false,
      ErrorMessage: message,
    },
    { status }
  )
}
