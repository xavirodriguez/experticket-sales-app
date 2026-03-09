import { NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-lastupdated
 * @description API route handler for checking the system's last updated status.
 */

/**
 * Handles GET requests to check the system's last updated status.
 *
 * @returns A promise that resolves to the JSON response containing the last updated status.
 */
export async function GET() {
  try {
    const data = await experticketService.getLastUpdated()
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
