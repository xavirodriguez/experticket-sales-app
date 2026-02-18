import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getPartnerId,
  getDefaultLanguage,
} from "@/lib/experticket/server-client"
import type { CatalogResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const lang = sp.get("LanguageCode") || getDefaultLanguage()

    const data = await experticketFetch<CatalogResponse>("/catalog", {
      params: {
        PartnerId: getPartnerId(),
        LanguageCode: lang,
      },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
