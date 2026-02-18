import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import type { TransactionDocumentsResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<TransactionDocumentsResponse>("/transactiondocuments", {
      params: {
        ApiKey: getEncodedApiKey(),
        id: sp.get("id") || "",
        IncludeTransactionDocumentsLanguages: sp.get("IncludeTransactionDocumentsLanguages") || "true",
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
