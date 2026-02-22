/**
 * @module LastUpdatedRoute
 * @description Proxy route for checking the last update time of the Experticket system.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { LastUpdatedResponse } from "@/lib/experticket/types"

/**
 * Checks when the Experticket data was last updated.
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const data = await experticketFetch<LastUpdatedResponse>("/lastupdatedatetime", {
    params: { PartnerId: getPartnerId() },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
