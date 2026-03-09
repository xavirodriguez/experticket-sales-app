import { NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-languages
 * @description API route handler for retrieving supported languages from Experticket.
 */

/**
 * Handles GET requests to list supported languages.
 *
 * @returns A promise that resolves to the JSON response containing supported languages.
 */
export async function GET() {
  try {
    const data = await experticketService.getLanguages()
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
