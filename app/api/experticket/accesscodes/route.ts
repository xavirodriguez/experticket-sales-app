/**
 * @module AccessCodesRoute
 * @description Proxy route for retrieving Experticket access codes.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { AccessCodesResponse } from "@/lib/experticket/types"

/**
 * Retrieves access codes for a specific sale.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const data = await experticketFetch<AccessCodesResponse>("/transactionaccesscodes", {
    params: {
      ApiKey: getEncodedApiKey(),
      SaleId: sp.get("SaleId") || "",
      InternalCodes: sp.get("InternalCodes") || undefined,
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
