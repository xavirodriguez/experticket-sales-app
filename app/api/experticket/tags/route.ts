/**
 * @module TagsRoute
 * @description Proxy route for retrieving product/provider tags from Experticket.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { TagsResponse } from "@/lib/experticket/types"

/**
 * Retrieves the full hierarchy of tags.
 */
export const GET = withErrorHandler(async (_request: NextRequest) => {
  const data = await experticketFetch<TagsResponse>("/tags", {
    params: { PartnerId: getPartnerId() },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
