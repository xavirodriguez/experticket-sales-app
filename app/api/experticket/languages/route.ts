import { NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { LanguagesResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve supported languages.
 */
export async function GET() {
  try {
    const data = await experticketFetch<LanguagesResponse>("/languages", {
      params: { ApiKey: getEncodedApiKey() },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
