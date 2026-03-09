import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type { AvailableCapacityResponse, RealTimePricesResponse } from "../../lib/experticket/types"

export const availabilityHandlers = [
  // Get Capacity
  http.get(`${EXPERTICKET_API_BASE_URL}/capacity`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<AvailableCapacityResponse>("availability/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Prices
  http.get(`${EXPERTICKET_API_BASE_URL}/prices`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<RealTimePricesResponse>("availability/prices.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
