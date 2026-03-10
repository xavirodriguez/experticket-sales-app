import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-catalog
 * @description API route handler for retrieving the Experticket product catalog.
 */

/**
 * Handles GET requests to retrieve the product catalog.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the catalog.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const languageCode = searchParams.get("LanguageCode") || undefined
    const catalogData = await experticketService.getCatalog(languageCode)
    return NextResponse.json(catalogData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
