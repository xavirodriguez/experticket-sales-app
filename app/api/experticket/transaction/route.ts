import { NextRequest, NextResponse } from "next/server"
import { experticketService } from "@/lib/experticket/service"
import { createErrorResponse } from "@/lib/experticket/api-utils"

export const runtime = "nodejs"

/**
 * Handles POST requests to create a new transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const transactionRequest = await request.json()
    const transactionData = await experticketService.createTransaction(transactionRequest)
    return NextResponse.json(transactionData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}

/**
 * Handles GET requests to search or list transactions.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())
    const transactionListData = await experticketService.listTransactions(queryParams)
    return NextResponse.json(transactionListData)
  } catch (err: unknown) {
    return createErrorResponse(err)
  }
}
