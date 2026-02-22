/**
 * @module DocumentsRoute
 * @description Proxy route for retrieving Experticket transaction documents.
 */

import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import { EXPERTICKET_CONFIG } from "@/lib/constants"
import type { TransactionDocumentsResponse } from "@/lib/experticket/types"

/**
 * Retrieves PDF documents (tickets, vouchers) for a sale.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const data = await experticketFetch<TransactionDocumentsResponse>("/transactiondocuments", {
    params: {
      ApiKey: getEncodedApiKey(),
      SaleId: sp.get("id") || sp.get("SaleId") || "",
      LanguageCode: sp.get("LanguageCode") || undefined,
    },
    retries: EXPERTICKET_CONFIG.DEFAULT_RETRIES,
  })
  return NextResponse.json(data)
})
