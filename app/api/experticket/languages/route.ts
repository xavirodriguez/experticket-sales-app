/**
 * @module LanguagesRoute
 * @description Proxy route for retrieving supported languages from Experticket.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { LanguagesResponse } from "@/lib/experticket/types"

/**
 * Retrieves a list of all languages supported by the Experticket system.
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const data = await experticketFetch<LanguagesResponse>("/languages", {
    params: {
      PartnerId: getPartnerId(),
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
