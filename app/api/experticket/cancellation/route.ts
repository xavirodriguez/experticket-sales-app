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

    return await createCancellationRequest({ saleId, reason, reasonComments, extra: rest })
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Context object for creating a cancellation request.
 */
interface CancellationRequestContext {
  saleId: string
  reason: number
  reasonComments: string
  extra: Record<string, unknown>
}

/**
 * Handles GET requests to list cancellation requests.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToCancellationParams(searchParams)

    const data = await experticketFetch<CancellationListResponse>("/cancellationrequest", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Internal helper to check cancellation status.
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
 * Internal helper to create a cancellation request.
 */
async function createCancellationRequest(context: CancellationRequestContext) {
  const payload = buildCancellationPayload(context)

  const data = await experticketFetch<CancellationRequestResponse>("/cancellationrequest", {
    method: "POST",
    body: payload,
  })
  return NextResponse.json(data)
}

/**
 * Builds the payload for a cancellation request.
 */
function buildCancellationPayload({
  saleId,
  reason,
  reasonComments,
  extra,
}: CancellationRequestContext) {
  return {
    ApiKey: getApiKey(),
    SaleId: saleId,
    Reason: reason ?? 0,
    ReasonComments: reasonComments || undefined,
    ...extra,
  }
}

/**
 * Maps URL search parameters to Experticket cancellation query parameters.
 */
function mapSearchParamsToCancellationParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    SaleId: searchParams.get("SaleId") || undefined,
    FromCreatedDateTime: searchParams.get("FromCreatedDateTime") || undefined,
    ToCreatedDateTime: searchParams.get("ToCreatedDateTime") || undefined,
    FromUpdatedDateTime: searchParams.get("FromUpdatedDateTime") || undefined,
    ToUpdatedDateTime: searchParams.get("ToUpdatedDateTime") || undefined,
    Status: searchParams.get("Status") || undefined,
    PageSize: searchParams.get("PageSize") || "20",
    Page: searchParams.get("Page") || "1",
  }
}
