import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse, getQueryParams } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * Handles GET requests to retrieve the list of providers.
 */
export async function GET(request: NextRequest) {
  try {
    const params = getQueryParams(request)
    const languageCode = (params.LanguageCode as string) || undefined
    const providersData = await experticketService.getProviders(languageCode, params)
    return NextResponse.json(providersData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
