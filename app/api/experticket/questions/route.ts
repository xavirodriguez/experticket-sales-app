/**
 * @module QuestionsRoute
 * @description Proxy route for retrieving required ticket questions from Experticket.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

/**
 * Retrieves the ticket questions profile for specific products and languages.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const data = await experticketFetch<TicketQuestionsResponse>("/ticketquestions", {
    params: {
      PartnerId: getPartnerId(),
      ProductIds: sp.get("ProductIds") || undefined,
      TicketsQuestionsProfileIds: sp.get("TicketsQuestionsProfileIds") || undefined,
      LanguageCode: sp.get("LanguageCode") || undefined,
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})

/**
 * Alternative POST handler for retrieving ticket questions.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
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
})
