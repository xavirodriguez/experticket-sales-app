import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { LastUpdatedResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to check the system's last updated status.
 */
export async function GET(_request: NextRequest) {
  try {
    const data = await experticketFetch<LastUpdatedResponse>("/lastupdated", {
      params: { ApiKey: getApiKey() },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
