import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import {
  adaptTransaction,
  adaptTransactionList,
  adaptDocuments,
  adaptAccessCodes
} from "../../lib/experticket/adapter"
import type {
  Transaction,
  TransactionListResponse,
  TransactionDocumentsResponse,
  AccessCodesResponse
} from "../../lib/experticket/types"

export const transactionHandlers = [
  // Create Transaction
  http.post(`${EXPERTICKET_API_BASE_URL}/transaction`, async () => {
    try {
      const data = loadFixture<Transaction>("transaction/success.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.post("/api/experticket/transaction", async () => {
    try {
      const raw = loadFixture<Transaction>("transaction/success.json")
      return jsonResponse(adaptTransaction(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Query Transactions
  http.get(`${EXPERTICKET_API_BASE_URL}/transaction`, () => {
    try {
      const data = loadFixture<TransactionListResponse>("transaction/list.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/transaction", () => {
    try {
      const raw = loadFixture<TransactionListResponse>("transaction/list.json")
      return jsonResponse(adaptTransactionList(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Documents
  http.get(`${EXPERTICKET_API_BASE_URL}/documents`, () => {
    try {
      const data = loadFixture<TransactionDocumentsResponse>("transaction/documents.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/documents", () => {
    try {
      const raw = loadFixture<TransactionDocumentsResponse>("transaction/documents.json")
      return jsonResponse(adaptDocuments(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Access Codes
  http.get(`${EXPERTICKET_API_BASE_URL}/accesscodes`, () => {
    try {
      const data = loadFixture<AccessCodesResponse>("transaction/accesscodes.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/accesscodes", () => {
    try {
      const raw = loadFixture<AccessCodesResponse>("transaction/accesscodes.json")
      return jsonResponse(adaptAccessCodes(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
