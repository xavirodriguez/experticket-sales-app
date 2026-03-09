import { NextRequest, NextResponse } from "next/server"
import { experticketFetch } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TransactionDocumentsResponse } from "@/lib/experticket/types"

export const runtime = "nodejs"

/**
 * @module api-experticket-documents
 * @description API route handler for retrieving transaction documents (tickets, invoices) from Experticket.
 */

/**
 * Handles GET requests to retrieve transaction documents.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the document information.
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
 *
 * @param searchParams - The search parameters from the request URL.
 * @returns An object containing the mapped parameters.
 */
function mapSearchParamsToDocumentsParams(searchParams: URLSearchParams) {
  return {
    id: searchParams.get("id") || "",
    IncludeTransactionDocumentsLanguages:
      searchParams.get("IncludeTransactionDocumentsLanguages") || "true",
  }
}
