import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import type { AvailableCapacityResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const params: Record<string, string | undefined> = {
      PartnerId: getPartnerId(),
      ProductBaseIds: sp.get("ProductBaseIds") || undefined,
      ProductIds: sp.get("ProductIds") || undefined,
      SessionIds: sp.get("SessionIds") || undefined,
      Dates: sp.get("Dates") || undefined,
      FromDate: sp.get("FromDate") || undefined,
      ToDate: sp.get("ToDate") || undefined,
      IncludePrices: sp.get("IncludePrices") || "true",
    }

    const data = await experticketFetch<AvailableCapacityResponse>("/availablecapacity", {
      params,
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
