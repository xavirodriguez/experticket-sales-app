import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TransactionListResponse } from "@/lib/experticket/types"

export const runtime = "nodejs"

/**
 * Handles POST requests to create a new transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      ...body,
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
  const getParam = (key: string) => searchParams.get(key) || undefined

  return {
    SaleId: getParam("SaleId"),
    ReservationId: getParam("ReservationId"),
    PartnerSaleId: getParam("PartnerSaleId"),
    PointOfSaleId: getParam("PointOfSaleId"),
    FromTransactionDateTime: getParam("FromTransactionDateTime"),
    ToTransactionDateTime: getParam("ToTransactionDateTime"),
    FromAccessDateTime: getParam("FromAccessDateTime"),
    ToAccessDateTime: getParam("ToAccessDateTime"),
    FromCancelledDateTime: getParam("FromCancelledDateTime"),
    ToCancelledDateTime: getParam("ToCancelledDateTime"),
    PageSize: searchParams.get("PageSize") || "20",
    Page: searchParams.get("Page") || "1",
    LanguageCode: getParam("LanguageCode"),
  }
}
