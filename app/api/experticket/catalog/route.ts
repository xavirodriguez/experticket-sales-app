import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getApiKey,
  getDefaultLanguage,
  getPartnerId,
} from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { CatalogResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve the product catalog.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lang = searchParams.get("LanguageCode") || getDefaultLanguage()

    const data = await experticketFetch<CatalogResponse>("/catalog", {
      params: {
        ApiKey: getApiKey(),
        PartnerId: getPartnerId(),
        LanguageCode: lang,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
