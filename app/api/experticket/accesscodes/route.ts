import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { AccessCodesResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve access codes for a transaction.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<AccessCodesResponse>("/transactionaccesscodes", {
      params: {
        ApiKey: getApiKey(),
        SaleId: sp.get("SaleId") || sp.get("id") || sp.get("transactionId") || "",
        InternalCodes: sp.get("InternalCodes") || undefined,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
