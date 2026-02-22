/**
 * @module PricesRoute
 * @description Proxy route for Experticket real-time pricing operations.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

/**
 * Calculates real-time prices for products on specific dates.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const payload = {
    PartnerId: getPartnerId(),
    ...body,
  }

  const data = await experticketFetch<RealTimePricesResponse>("/realtimeprices", {
    method: "POST",
    body: payload,
  })
  return NextResponse.json(data)
})
