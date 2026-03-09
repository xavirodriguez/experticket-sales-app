import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import { experticketFetch } from "@/lib/experticket/server-client"

export const runtime = "nodejs"

/**
 * Handles POST requests to create a temporary reservation.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await experticketService.createReservation(body)
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
    // DELETE reservation is not currently in the service, using direct fetch for now
    // as it's a simple teardown operation.
    const data = await experticketFetch("reservation", {
      method: "DELETE",
      body,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
