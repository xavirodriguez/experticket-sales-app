import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-accesscodes
 * @description API route handler for retrieving transaction access codes from Experticket.
 */

/**
 * Handles GET requests to retrieve access codes.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the access codes.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const saleId = searchParams.get("SaleId") || ""
    const data = await experticketService.getAccessCodes(saleId)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
