import { NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-tags
 * @description API route handler for retrieving the product tag hierarchy from Experticket.
 */

/**
 * Handles GET requests to retrieve the product tag hierarchy.
 *
 * @returns A promise that resolves to the JSON response containing the tags.
 */
export async function GET() {
  try {
    const data = await experticketService.getTags()
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
