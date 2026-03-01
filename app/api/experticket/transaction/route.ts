import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TransactionListResponse } from "@/lib/experticket/types"

/**
 * Handles POST requests to create a new transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      ...body,
      ApiKey: getApiKey(),
    }

    const data = await experticketFetch("/transaction", {
      method: "POST",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles GET requests to search or list transactions.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const params = mapSearchParamsToTransactionParams(sp)

    const data = await experticketFetch<TransactionListResponse>("/transaction", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket transaction query parameters.
 */
function mapSearchParamsToTransactionParams(sp: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
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
    PageSize: sp.get("PageSize") || "20",
    Page: sp.get("Page") || "1",
    LanguageCode: sp.get("LanguageCode") || undefined,
  }
}
