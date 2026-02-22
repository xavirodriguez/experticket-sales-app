/**
 * @module ReservationRoute
 * @description Proxy route for Experticket reservation operations.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  experticketFetch,
  getRawApiKey,
} from "@/lib/experticket/server-client"
import { withErrorHandler } from "@/lib/experticket/api-utils"
import type { ReservationResponse } from "@/lib/experticket/types"

/**
 * Creates a new reservation for products.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
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
})

/**
 * Cancels an existing reservation.
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams
  const payload = {
    ApiKey: getRawApiKey(),
    ReservationId: sp.get("ReservationId") || "",
    IsTest: sp.get("IsTest") === "true",
  }

  const data = await experticketFetch<ReservationResponse>("/reservation", {
    method: "DELETE",
    body: payload,
  })
  return NextResponse.json(data)
})
