import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey, getPartnerId } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { AvailableCapacityResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to check available capacity.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToCapacityParams(searchParams)

    const data = await experticketFetch<AvailableCapacityResponse>("/availablecapacity", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket capacity query parameters.
 */
function mapSearchParamsToCapacityParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    PartnerId: getPartnerId(),
    ProductBaseIds: searchParams.get("ProductBaseIds") || undefined,
    ProductIds: searchParams.get("ProductIds") || undefined,
    SessionIds: searchParams.get("SessionIds") || undefined,
    Dates: searchParams.get("Dates") || undefined,
    FromDate: searchParams.get("FromDate") || undefined,
    ToDate: searchParams.get("ToDate") || undefined,
    IncludePrices: searchParams.get("IncludePrices") || "true",
  }
}
