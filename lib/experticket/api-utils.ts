import { NextResponse } from "next/server"

/**
 * @module experticket-api-utils
 * @description Utility functions for Next.js API route handlers.
 */

/**
 * Creates a standardized error response for Experticket API routes.
 *
 * @param err - The error object or message.
 * @param status - The HTTP status code (defaults to 502).
 * @returns A Next.js response object with the error details.
 */
export function createErrorResponse(err: unknown, status: number = 502) {
  const message = err instanceof Error ? err.message : "Unknown error"
  return NextResponse.json(
    {
      Success: false,
      ErrorMessage: message,
    },
    { status }
  )
}
