import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

/**
 * Handles POST requests to retrieve ticket questions for specific products.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      PartnerId: getPartnerId(),
      ...body,
    }

    const data = await experticketFetch<TicketQuestionsResponse>("/ticketquestions", {
      method: "POST",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
