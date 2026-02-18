import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
  getEncodedApiKey,
} from "@/lib/experticket/server-client"
import type { TransactionListResponse } from "@/lib/experticket/types"

export async function POST(request: NextRequest) {
  try {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}

export async function GET(request: NextRequest) {
  try {
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
      PageSize: sp.get("PageSize") || "20",
      Page: sp.get("Page") || "1",
      LanguageCode: sp.get("LanguageCode") || undefined,
    }

    const data = await experticketFetch<TransactionListResponse>("/transaction", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
