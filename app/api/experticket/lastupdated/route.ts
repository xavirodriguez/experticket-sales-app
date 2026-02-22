import { NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { LastUpdatedResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to check when the catalog was last updated.
 */
export async function GET() {
  try {
    const data = await experticketFetch<LastUpdatedResponse>("/cataloglastupdated", {
      params: { PartnerId: getPartnerId() },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
