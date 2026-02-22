/**
 * @module api-utils
 * @description Server-side utilities for handling API route logic and common error patterns.
 */

import { NextRequest, NextResponse } from "next/server"
import { HTTP_STATUS } from "@/lib/constants"

/**
 * A standard wrapper for API route handlers to provide consistent error handling.
 *
 * @param handler - The async function that performs the route logic.
 * @returns A NextResponse object.
 *
 * @example
 * ```typescript
 * export const POST = withErrorHandler(async (req) => {
 *   const data = await doSomething();
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withErrorHandler<T = unknown>(
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error(`[API Error] ${request.url}:`, err)

      return NextResponse.json(
        {
          Success: false,
          ErrorMessage: message,
          Timestamp: new Date().toISOString()
        } as any,
        { status: HTTP_STATUS.BAD_GATEWAY }
      )
    }
  }
}
