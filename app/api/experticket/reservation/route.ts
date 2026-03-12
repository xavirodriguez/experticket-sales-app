import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-reservation
 * @description API route handler for managing reservations in Experticket.
 */

/**
 * Handles POST requests to create a temporary reservation.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the reservation details.
 */
export async function POST(request: NextRequest) {
  try {
    const reservationRequest = await request.json()
    const reservationData = await experticketService.createReservation(
      reservationRequest
    )
    return NextResponse.json(reservationData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles DELETE requests to cancel a reservation.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response indicating success or failure.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ReservationId } = body
    const result = await experticketService.deleteReservation(ReservationId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
