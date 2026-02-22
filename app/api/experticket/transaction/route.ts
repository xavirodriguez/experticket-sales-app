/**
 * @module TransactionRoute
 * @description Proxy route for Experticket transaction operations.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
  getEncodedApiKey,
} from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { TransactionListResponse } from "@/lib/experticket/types"

/**
 * Handles the creation of a new transaction from a reservation.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json()
  const payload = {
    ...body,
    ApiKey: getRawApiKey(),
  }

  const data = await experticketFetch("/transaction", {
    method: "POST",
    body: payload,
  })
  return NextResponse.json(data)
})

/**
 * Searches for transactions based on various criteria.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const params: Record<string, string | undefined> = {
    ApiKey: getEncodedApiKey(),
    SaleId: sp.get("SaleId") || undefined,
    ReservationId: sp.get("ReservationId") || undefined,
    PartnerSaleId: sp.get("PartnerSaleId") || undefined,
    PointOfSaleId: sp.get("PointOfSaleId") || undefined,
    FromTransactionDateTime: sp.get("FromTransactionDateTime") || undefined,
    ToTransactionDateTime: sp.get("ToTransactionDateTime") || undefined,
    FromAccessDateTime: sp.get("FromAccessDateTime") || undefined,
    ToAccessDateTime: sp.get("ToAccessDateTime") || undefined,
    FromCancelledDateTime: sp.get("FromCancelledDateTime") || undefined,
    ToCancelledDateTime: sp.get("ToCancelledDateTime") || undefined,
    PageSize: sp.get("PageSize") || String(EXPERTICKET_CONFIG.DEFAULT_PAGE_SIZE),
    Page: sp.get("Page") || "1",
    LanguageCode: sp.get("LanguageCode") || undefined,
  }

  const data = await experticketFetch<TransactionListResponse>("/transaction", {
    params,
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
