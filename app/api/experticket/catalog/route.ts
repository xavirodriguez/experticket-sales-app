/**
 * @module CatalogRoute
 * @description Proxy route for retrieving the Experticket product catalog.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getPartnerId,
  getDefaultLanguage,
} from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { CatalogResponse } from "@/lib/experticket/types"

/**
 * Retrieves the full product catalog for a partner.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const lang = sp.get("LanguageCode") || getDefaultLanguage()

  const data = await experticketFetch<CatalogResponse>("/catalog", {
    params: {
      PartnerId: getPartnerId(),
      LanguageCode: lang,
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
