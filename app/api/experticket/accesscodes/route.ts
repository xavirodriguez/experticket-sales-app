import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getEncodedApiKey } from "@/lib/experticket/server-client"
import type { AccessCodesResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<AccessCodesResponse>("/transactionaccesscodes", {
      params: {
        ApiKey: getEncodedApiKey(),
        SaleId: sp.get("SaleId") || "",
        InternalCodes: sp.get("InternalCodes") || undefined,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
