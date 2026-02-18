import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import type { LanguagesResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const data = await experticketFetch<LanguagesResponse>("/AvailableLanguages", {
      params: {
        PartnerId: getPartnerId(),
        "api-version": sp.get("api-version") || "3.51",
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
