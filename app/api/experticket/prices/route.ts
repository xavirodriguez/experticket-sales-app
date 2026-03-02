import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve real-time pricing information.
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
 */
function mapSearchParamsToPricingParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    AccessDateTime: searchParams.get("AccessDateTime") || "",
    Products: searchParams.get("Products") || "",
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
