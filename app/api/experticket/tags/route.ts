import { NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TagsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve the tag hierarchy.
 */
export async function GET() {
  try {
    const data = await experticketFetch<TagsResponse>("/tags", {
      params: { PartnerId: getPartnerId() },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
