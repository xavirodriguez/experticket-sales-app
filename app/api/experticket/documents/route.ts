import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * @module api-experticket-documents
 * @description API route handler for retrieving transaction documents (tickets, invoices) from Experticket.
 */

/**
 * Handles GET requests to retrieve transaction documents.
 *
 * @param request - The Next.js request object.
 * @returns A promise that resolves to the JSON response containing the document information.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id") || ""
    const data = await experticketService.getDocuments(id)
    return NextResponse.json(data)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
