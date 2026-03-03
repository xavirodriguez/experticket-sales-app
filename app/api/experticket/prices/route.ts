import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

/**
 * @module api-experticket-prices
 * @description API route handler for retrieving real-time product prices from Experticket.
 */

/**
 * Handles GET requests to retrieve real-time pricing information.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing real-time prices.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToPricingParams(searchParams)

    const data = await experticketFetch<RealTimePricesResponse>("/productsrealtimeprice", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket pricing query parameters.
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToPricingParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    AccessDateTime: searchParams.get("AccessDateTime") || "",
    Products: searchParams.get("Products") || "",
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
