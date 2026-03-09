import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

export const runtime = "nodejs"

/**
 * @module api-experticket-questions
 * @description API route handler for retrieving required ticket questions from Experticket.
 */

/**
 * Handles GET requests to retrieve required ticket questions.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the ticket questions.
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
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToQuestionsParams(searchParams: URLSearchParams) {
  return {
    Tickets: searchParams.get("Tickets") || "",
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
