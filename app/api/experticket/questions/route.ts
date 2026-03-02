import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve required ticket questions.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToQuestionsParams(searchParams)

    const data = await experticketFetch<TicketQuestionsResponse>("/ticketquestions", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket ticket questions query parameters.
 */
function mapSearchParamsToQuestionsParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    Tickets: searchParams.get("Tickets") || "",
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
