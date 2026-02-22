/**
 * @module CapacityRoute
 * @description Proxy route for checking Experticket available capacity.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { AvailableCapacityResponse } from "@/lib/experticket/types"

/**
 * Checks available capacity for products and dates.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const data = await experticketFetch<AvailableCapacityResponse>("/availablecapacity", {
    params: {
      PartnerId: getPartnerId(),
      ProductBaseIds: sp.get("ProductBaseIds") || undefined,
      ProductIds: sp.get("ProductIds") || undefined,
      SessionIds: sp.get("SessionIds") || undefined,
      Dates: sp.get("Dates") || "",
      IncludePrices: sp.get("IncludePrices") || "false",
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
