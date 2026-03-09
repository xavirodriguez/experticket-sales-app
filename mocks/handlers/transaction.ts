import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type {
  Transaction,
  TransactionListResponse,
  TransactionDocumentsResponse,
  AccessCodesResponse
} from "../../lib/experticket/types"

export const transactionHandlers = [
  // Create Transaction
  http.post(`${EXPERTICKET_API_BASE_URL}/transaction`, async ({ request }) => {
    const body = await request.json() as any
    const error = checkParams(body, ["ApiKey", "ReservationId", "AccessDateTime", "Products"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<Transaction>("transaction/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Query Transactions
  http.get(`${EXPERTICKET_API_BASE_URL}/transaction`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<TransactionListResponse>("transaction/list.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Documents
  http.get(`${EXPERTICKET_API_BASE_URL}/documents`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "SaleId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<TransactionDocumentsResponse>("transaction/documents.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Access Codes
  http.get(`${EXPERTICKET_API_BASE_URL}/accesscodes`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<AccessCodesResponse>("transaction/accesscodes.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
