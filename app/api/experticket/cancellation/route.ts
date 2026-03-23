import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse, getQueryParams } from "@/lib/experticket/api-utils"
import { DEFAULT_CANCELLATION_REASON } from "@/lib/experticket/constants"

export const runtime = "nodejs"

/**
 * Handles POST requests to create or check cancellation requests.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, saleId, reason, reasonComments, ...rest } = body

    if (action === "check") {
      const data = await experticketService.checkCancellationEligibility(saleId)
      return NextResponse.json(data)
    }

    const data = await experticketService.createCancellation({
      SaleId: saleId,
      Reason: reason ?? DEFAULT_CANCELLATION_REASON,
      ReasonComments: reasonComments || undefined,
      ...rest,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles GET requests to list cancellation requests.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const data = await experticketService.listCancellations(params)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
