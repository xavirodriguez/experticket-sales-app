import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { LanguagesResponse } from "@/lib/experticket/types"

/**
 * @module api-experticket-languages
 * @description API route handler for retrieving supported languages from Experticket.
 */

/**
 * Handles GET requests to list supported languages.
 *
 * @param _request - The Next.js request object (unused).
 * @returns A promise that resolves to the JSON response containing supported languages.
 */
export async function GET(_request: NextRequest) {
  try {
    const params = mapSearchParamsToLanguagesParams()
    const data = await experticketFetch<LanguagesResponse>("/languages", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps parameters for the languages request.
 *
 * @returns An object containing the API key.
 */
function mapSearchParamsToLanguagesParams() {
  return {
    ApiKey: getApiKey(),
  }
}
