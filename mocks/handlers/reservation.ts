import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import { adaptReservation } from "../../lib/experticket/adapter"
import type { ReservationResponse } from "../../lib/experticket/types"

export const reservationHandlers = [
  // Create Reservation
  http.post(`${EXPERTICKET_API_BASE_URL}/reservation`, async () => {
    try {
      const data = loadFixture<ReservationResponse>("reservation/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.post("/api/experticket/reservation", async () => {
    try {
      const raw = loadFixture<ReservationResponse>("reservation/success.json")
      return jsonResponse(adaptReservation(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Cancel Reservation
  http.delete(`${EXPERTICKET_API_BASE_URL}/reservation`, () => {
    try {
      return jsonResponse({ Success: true, Timestamp: new Date().toISOString() })
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.delete("/api/experticket/reservation", () => {
    try {
      return jsonResponse({ Success: true, Timestamp: new Date().toISOString() })
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
