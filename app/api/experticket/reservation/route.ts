import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
} from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { ReservationResponse } from "@/lib/experticket/types"

/**
 * Handles POST requests to create a new reservation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      ...body,
      ApiKey: getRawApiKey(),
    }

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
    const payload = {
      ...body,
      ApiKey: getRawApiKey(),
    }

    const data = await experticketFetch("/reservation", {
      method: "DELETE",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
