import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import { adaptCancellations } from "../../lib/experticket/adapter"
import type {
  CancellationRequestResponse,
  CancellationListResponse
} from "../../lib/experticket/types"

export const cancellationHandlers = [
  // Create Cancellation Request
  http.post(`${EXPERTICKET_API_BASE_URL}/cancellation`, async () => {
    try {
      const data = loadFixture<CancellationRequestResponse>("cancellation/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.post("/api/experticket/cancellation", async () => {
    try {
      const data = loadFixture<CancellationRequestResponse>("cancellation/success.json")
      // CancellationRequestResponse is already camelCase in types.ts (alias to CancellationRequestResponse)
      // and adaptCancellations is for the list.
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // List Cancellation Requests
  http.get(`${EXPERTICKET_API_BASE_URL}/cancellation`, () => {
    try {
      const data = loadFixture<CancellationListResponse>("cancellation/list.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/cancellation", () => {
    try {
      const raw = loadFixture<CancellationListResponse>("cancellation/list.json")
      return jsonResponse(adaptCancellations(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
