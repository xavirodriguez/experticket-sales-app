import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve real-time pricing information.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<RealTimePricesResponse>("/productsrealtimeprice", {
      params: {
        ApiKey: getApiKey(),
        AccessDateTime: sp.get("AccessDateTime") || "",
        Products: sp.get("Products") || "",
        LanguageCode: sp.get("LanguageCode") || undefined,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
