import { NextResponse } from "next/server"

/**
 * @module experticket-api-utils
 * @description Utility functions for Next.js API route handlers.
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
export function createErrorResponse(err: unknown, status: number = 502) {
  const message = err instanceof Error ? err.message : "Unknown error"
  // @ts-ignore
  const upstreamStatus = err?.status || status
  // @ts-ignore
  const details = err?.details || undefined

  if (process.env.NODE_ENV === "development") {
    console.error("[Experticket API Error]:", {
      message,
      upstreamStatus,
      details,
      err,
    })
  }

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
