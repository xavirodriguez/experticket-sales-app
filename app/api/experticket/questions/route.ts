import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import type { TicketQuestionsResponse } from "@/lib/experticket/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      PartnerId: getPartnerId(),
      ...body,
    }

    const data = await experticketFetch<TicketQuestionsResponse>("/checkticketsquestions", {
      method: "POST",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
