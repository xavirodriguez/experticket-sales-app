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
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToTransactionParams(searchParams)

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
function mapSearchParamsToTransactionParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    SaleId: searchParams.get("SaleId") || undefined,
    ReservationId: searchParams.get("ReservationId") || undefined,
    PartnerSaleId: searchParams.get("PartnerSaleId") || undefined,
    PointOfSaleId: searchParams.get("PointOfSaleId") || undefined,
    FromTransactionDateTime: searchParams.get("FromTransactionDateTime") || undefined,
    ToTransactionDateTime: searchParams.get("ToTransactionDateTime") || undefined,
    FromAccessDateTime: searchParams.get("FromAccessDateTime") || undefined,
    ToAccessDateTime: searchParams.get("ToAccessDateTime") || undefined,
    FromCancelledDateTime: searchParams.get("FromCancelledDateTime") || undefined,
    ToCancelledDateTime: searchParams.get("ToCancelledDateTime") || undefined,
    PageSize: searchParams.get("PageSize") || "20",
    Page: searchParams.get("Page") || "1",
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
