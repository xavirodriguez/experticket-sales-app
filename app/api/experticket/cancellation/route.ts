import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type {
  CancellationListResponse,
  CancellationRequestResponse,
} from "@/lib/experticket/types"

/**
 * Handles POST requests to create or check cancellation requests.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, saleId, reason, reasonComments, ...rest } = body

    if (action === "check") {
      return await checkCancellationStatus(saleId)
    }

    return await createCancellationRequest(saleId, reason, reasonComments, rest)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles GET requests to list cancellation requests.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
      params: {
        ApiKey: getApiKey(),
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
    return createErrorResponse(err)
  }
}

/**
 * Checks cancellation status for a specific sale.
 */
async function checkCancellationStatus(saleId: string) {
  const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
    params: {
      ApiKey: getApiKey(),
      SaleId: saleId,
      PageSize: "10",
      Page: "1",
    },
    retries: 1,
  })
  return NextResponse.json(data)
}

/**
 * Creates a new cancellation request.
 */
async function createCancellationRequest(
  saleId: string,
  reason: number,
  reasonComments: string,
  extra: Record<string, unknown>
) {
  const payload = {
    ApiKey: getApiKey(),
    SaleId: saleId,
    Reason: reason ?? 0,
    ReasonComments: reasonComments || undefined,
    ...extra,
  }

  const data = await experticketFetch<CancellationRequestResponse>("/cancellationrequest", {
    method: "POST",
    body: payload,
  })
  return NextResponse.json(data)
}
