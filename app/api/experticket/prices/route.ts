import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-prices
 * @description API route handler for retrieving real-time product prices from Experticket.
 */

/**
 * Handles POST requests to retrieve real-time pricing information.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing real-time prices.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await experticketService.getRealTimePrices(body)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
