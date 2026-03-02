import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { AccessCodesResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve access codes.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToAccessCodesParams(searchParams)

    const data = await experticketFetch<AccessCodesResponse>("/transactionaccesscodes", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket access codes query parameters.
 */
function mapSearchParamsToAccessCodesParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    SaleId: searchParams.get("SaleId") || "",
    InternalCodes: searchParams.get("InternalCodes") || undefined,
  }
}
