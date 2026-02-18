import { NextRequest, NextResponse } from "next/server"
import { experticketFetch, getPartnerId } from "@/lib/experticket/server-client"
import type { TagsResponse } from "@/lib/experticket/types"

export async function GET(request: NextRequest) {
  try {
    void request
    const data = await experticketFetch<TagsResponse>("/tags", {
      params: { PartnerId: getPartnerId() },
      retries: 1,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
