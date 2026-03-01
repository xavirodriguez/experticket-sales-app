import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve required ticket questions.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<TicketQuestionsResponse>("/ticketquestions", {
      params: {
        ApiKey: getApiKey(),
        Tickets: sp.get("Tickets") || "",
        LanguageCode: sp.get("LanguageCode") || undefined,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
