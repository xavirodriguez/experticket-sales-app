import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
  getEncodedApiKey,
} from "@/lib/experticket/server-client"
import type { CancellationRequestResponse, CancellationListResponse } from "@/lib/experticket/types"

export async function POST(request: NextRequest) {
  try {
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
        retries: 1,
      })
      return NextResponse.json(data)
    }

    // Default: create a cancellation request
    const payload = {
      ApiKey: getRawApiKey(),
      SaleId: saleId,
      Reason: reason ?? 0,
      ReasonComments: reasonComments || undefined,
      ...rest,
    }

    const data = await experticketFetch<CancellationRequestResponse>("/cancellationrequest", {
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
    const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
      params: {
        ApiKey: getEncodedApiKey(),
        SaleId: sp.get("SaleId") || undefined,
        FromCreatedDateTime: sp.get("FromCreatedDateTime") || undefined,
        ToCreatedDateTime: sp.get("ToCreatedDateTime") || undefined,
        FromUpdatedDateTime: sp.get("FromUpdatedDateTime") || undefined,
        ToUpdatedDateTime: sp.get("ToUpdatedDateTime") || undefined,
        Status: sp.get("Status") || undefined,
        PageSize: sp.get("PageSize") || "20",
        Page: sp.get("Page") || "1",
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
