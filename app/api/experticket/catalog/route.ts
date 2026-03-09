import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getDefaultLanguage } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { CatalogResponse } from "@/lib/experticket/types"

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
    const params = mapSearchParamsToCatalogParams(searchParams)

    const data = await experticketFetch<CatalogResponse>("/catalog", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket catalog query parameters.
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToCatalogParams(searchParams: URLSearchParams) {
  return {
    LanguageCode: searchParams.get("LanguageCode") || getDefaultLanguage(),
  }
}
