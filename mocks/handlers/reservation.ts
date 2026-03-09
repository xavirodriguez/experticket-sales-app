import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type { ReservationResponse, ExperticketBaseResponse } from "../../lib/experticket/types"

export const reservationHandlers = [
  // Create Reservation
  http.post(`${EXPERTICKET_API_BASE_URL}/reservation`, async ({ request }) => {
    const body = await request.json() as any
    const error = checkParams(body, ["ApiKey", "AccessDateTime", "Products"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<ReservationResponse>("reservation/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Cancel Reservation (Experticket uses DELETE for reservation cancellation)
  http.delete(`${EXPERTICKET_API_BASE_URL}/reservation`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "ReservationId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      // Typically returns ExperticketBaseResponse with Success: true
      return jsonResponse({ Success: true, Timestamp: new Date().toISOString() })
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
