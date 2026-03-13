import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse, getQueryParams } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-capacity
 * @description API route handler for checking product availability/capacity from Experticket.
 */

/**
 * Handles GET requests to check available capacity.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the available capacity.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const data = await experticketService.getCapacity(params)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
