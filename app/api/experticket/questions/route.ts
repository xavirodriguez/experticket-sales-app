import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-questions
 * @description API route handler for retrieving required ticket questions from Experticket.
 */

/**
 * Handles POST requests to retrieve required ticket questions.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the ticket questions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = await experticketService.checkTicketQuestions(body)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
