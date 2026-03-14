import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import { adaptCapacity, adaptPrices } from "../../lib/experticket/adapter"
import type { AvailableCapacityResponse, RealTimePricesResponse } from "../../lib/experticket/types"

export const availabilityHandlers = [
  // Get Capacity
  http.get(`${EXPERTICKET_API_BASE_URL}/availablecapacity`, ({ request }) => {
    const url = new URL(request.url)
    if (!url.searchParams.get("PartnerId")) return errorResponse("Missing required parameter: PartnerId", 400)
    try {
      const data = loadFixture<AvailableCapacityResponse>("availability/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/capacity", () => {
    try {
      const raw = loadFixture<AvailableCapacityResponse>("availability/default.json")
      return jsonResponse(adaptCapacity(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Prices
  http.post(`${EXPERTICKET_API_BASE_URL}/RealTimePrices`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body.PartnerId) return errorResponse("Missing required parameter: PartnerId", 400)
    try {
      const data = loadFixture<RealTimePricesResponse>("availability/prices.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.post("/api/experticket/prices", () => {
    try {
      const raw = loadFixture<RealTimePricesResponse>("availability/prices.json")
      return jsonResponse(adaptPrices(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
