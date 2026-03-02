import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TransactionDocumentsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve transaction documents.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = mapSearchParamsToDocumentsParams(searchParams)

    const data = await experticketFetch<TransactionDocumentsResponse>("/transactiondocuments", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Maps URL search parameters to Experticket transaction documents query parameters.
 */
function mapSearchParamsToDocumentsParams(searchParams: URLSearchParams) {
  return {
    ApiKey: getApiKey(),
    id: searchParams.get("id") || "",
    IncludeTransactionDocumentsLanguages:
      searchParams.get("IncludeTransactionDocumentsLanguages") || "true",
  }
}
