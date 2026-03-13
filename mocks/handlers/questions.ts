import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import { adaptQuestions } from "../../lib/experticket/adapter"
import type { TicketQuestionsResponse } from "../../lib/experticket/types"

export const questionsHandlers = [
  // Get Questions
  http.post(`${EXPERTICKET_API_BASE_URL}/checkticketsquestions`, async ({ request }) => {
    const body = (await request.json()) as any
    if (!body.PartnerId) return errorResponse("Missing required parameter: PartnerId", 400)
    try {
      const data = loadFixture<TicketQuestionsResponse>("questions/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.post("/api/experticket/questions", () => {
    try {
      const raw = loadFixture<TicketQuestionsResponse>("questions/default.json")
      return jsonResponse(adaptQuestions(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
