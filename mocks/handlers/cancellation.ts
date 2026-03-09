import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type {
  CancellationRequestResponse,
  CancellationListResponse
} from "../../lib/experticket/types"

export const cancellationHandlers = [
  // Create Cancellation Request
  http.post(`${EXPERTICKET_API_BASE_URL}/cancellation`, async ({ request }) => {
    const body = await request.json() as any
    const error = checkParams(body, ["ApiKey", "SaleId", "Reason"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<CancellationRequestResponse>("cancellation/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // List Cancellation Requests
  http.get(`${EXPERTICKET_API_BASE_URL}/cancellation`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<CancellationListResponse>("cancellation/list.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
