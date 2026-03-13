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

    const filters: Record<string, string | string[]> = {}
    const supportedFilters = [
      "ProviderIds",
      "ProductBaseIds",
      "ProductIds",
      "FromDate",
      "ToDate",
      "ReferenceDate",
      "api-version",
    ]

    supportedFilters.forEach((key) => {
      const values = searchParams.getAll(key)
      if (values.length > 1) {
        filters[key] = values
      } else if (values.length === 1) {
        filters[key] = values[0]
      }
    })

    const catalogData = await experticketService.getCatalog(languageCode, filters)
    return NextResponse.json(catalogData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
