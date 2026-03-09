import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { AccessCodesResponse } from "@/lib/experticket/types"

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
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToAccessCodesParams(searchParams: URLSearchParams) {
  return {
    SaleId: searchParams.get("SaleId") || "",
    InternalCodes: searchParams.get("InternalCodes") || undefined,
  }
}
