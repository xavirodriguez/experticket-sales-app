import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { LastUpdatedResponse } from "@/lib/experticket/types"

export const runtime = "nodejs"

/**
 * @module api-experticket-lastupdated
 * @description API route handler for checking the system's last updated status.
 */

/**
 * Handles GET requests to check the system's last updated status.
 *
 * @param _request - The Next.js request object (unused).
 * @returns A promise that resolves to the JSON response containing the last updated status.
 */
export async function GET(_request: NextRequest) {
  try {
    const data = await experticketFetch<LastUpdatedResponse>("/lastupdated", {
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
