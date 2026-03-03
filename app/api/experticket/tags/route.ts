import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TagsResponse } from "@/lib/experticket/types"

/**
 * @module api-experticket-tags
 * @description API route handler for retrieving the product tag hierarchy from Experticket.
 */

/**
 * Handles GET requests to retrieve the product tag hierarchy.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the tags.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToTagsParams(searchParams)

    const data = await experticketFetch<TagsResponse>("/tags", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket tags query parameters.
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToTagsParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    LanguageCode: searchParams.get("LanguageCode") || undefined,
  }
}
