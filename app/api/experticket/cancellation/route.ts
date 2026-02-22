/**
 * @module CancellationRoute
 * @description Proxy route for Experticket cancellation operations.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
  getEncodedApiKey,
} from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG, CANCELLATION_REASONS } from "@/lib/constants"
import type { CancellationRequestResponse, CancellationListResponse } from "@/lib/experticket/types"

/**
 * Handles checking cancellation eligibility or creating a cancellation request.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const { action, saleId, reason, reasonComments, ...rest } = body

  if (action === "check") {
    // Check cancellation status by listing cancellation requests for this sale
    const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
      params: {
        ApiKey: getEncodedApiKey(),
        SaleId: saleId,
        PageSize: "10",
        Page: "1",
      },
      retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
    })
    return NextResponse.json(data)
  }

  // Default: create a cancellation request
  const payload = {
    ApiKey: getRawApiKey(),
    SaleId: saleId,
    Reason: reason ?? CANCELLATION_REASONS.DEFAULT,
    ReasonComments: reasonComments || undefined,
    ...rest,
  }

  const data = await experticketFetch<CancellationRequestResponse>("/cancellationrequest", {
    method: "POST",
    body: payload,
  })
  return NextResponse.json(data)
})

/**
 * Lists cancellation requests based on filters.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
    params: {
      ApiKey: getEncodedApiKey(),
      SaleId: sp.get("SaleId") || undefined,
      FromCreatedDateTime: sp.get("FromCreatedDateTime") || undefined,
      ToCreatedDateTime: sp.get("ToCreatedDateTime") || undefined,
      FromUpdatedDateTime: sp.get("FromUpdatedDateTime") || undefined,
      ToUpdatedDateTime: sp.get("ToUpdatedDateTime") || undefined,
      Status: sp.get("Status") || undefined,
      PageSize: sp.get("PageSize") || String(EXPERTICKET_CONFIG.DEFAULT_PAGE_SIZE),
      Page: sp.get("Page") || "1",
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
