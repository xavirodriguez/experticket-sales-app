import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TagsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve the product tag hierarchy.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<TagsResponse>("/tags", {
      params: {
        ApiKey: getApiKey(),
        LanguageCode: sp.get("LanguageCode") || undefined,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
