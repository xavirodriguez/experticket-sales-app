import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { ReservationResponse } from "@/lib/experticket/types"

export const runtime = "nodejs"

/**
 * Handles POST requests to create a temporary reservation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = buildReservationPayload(body)

    const data = await experticketFetch<ReservationResponse>("/reservation", {
      method: "POST",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles DELETE requests to cancel a reservation.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = buildReservationPayload(body)

    const data = await experticketFetch("/reservation", {
      method: "DELETE",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Adds the API Key to the reservation payload.
 */
function buildReservationPayload(body: Record<string, unknown>) {
  return {
    ...body,
  }
}
