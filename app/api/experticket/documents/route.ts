import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import { createErrorResponse } from "@/lib/experticket/api-utils"
import type { TransactionDocumentsResponse } from "@/lib/experticket/types"

/**
 * Handles GET requests to retrieve documents for a transaction.
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<TransactionDocumentsResponse>("/transactiondocuments", {
      params: {
        ApiKey: getEncodedApiKey(),
        id: sp.get("id") || sp.get("SaleId") || sp.get("transactionId") || "",
        IncludeTransactionDocumentsLanguages:
          sp.get("IncludeTransactionDocumentsLanguages") || "true",
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
