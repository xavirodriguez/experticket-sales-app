import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type { TicketQuestionsResponse } from "../../lib/experticket/types"

export const questionsHandlers = [
  // Get Questions
  http.get(`${EXPERTICKET_API_BASE_URL}/questions`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<TicketQuestionsResponse>("questions/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
