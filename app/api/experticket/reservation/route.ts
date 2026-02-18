import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
} from "@/lib/experticket/server-client"
import type { ReservationResponse } from "@/lib/experticket/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      ...body,
      ApiKey: getRawApiKey(),
    }

    const data = await experticketFetch<ReservationResponse>("/reservation", {
      method: "POST",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = {
      ...body,
      ApiKey: getRawApiKey(),
    }

    const data = await experticketFetch("/reservation", {
      method: "DELETE",
      body: payload,
    })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ Success: false, ErrorMessage: message }, { status: 502 })
  }
}
