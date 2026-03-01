import test from "node:test"
import assert from "node:assert/strict"
import { resolveTransactionId, formatPrice, normalizeApiResponse } from "./utils"
import type { Transaction } from "./types"

test("resolveTransactionId extracts ID correctly", () => {
  const tx1: Transaction = { SaleId: "SALE123", Success: true }
  assert.strictEqual(resolveTransactionId(tx1), "SALE123")

  const tx2: Transaction = { TransactionId: "TX456", Success: true }
  assert.strictEqual(resolveTransactionId(tx2), "TX456")

  const tx3: Transaction = { Id: "ID789", Success: true }
  assert.strictEqual(resolveTransactionId(tx3), "ID789")

  const tx4: Transaction = { Success: true }
  assert.strictEqual(resolveTransactionId(tx4), "N/A")
})

test("formatPrice formats correctly", () => {
  assert.strictEqual(formatPrice(123.456), "123.46 EUR")
  assert.strictEqual(formatPrice("100", "USD"), "100.00 USD")
  assert.strictEqual(formatPrice(null), "N/A")
  assert.strictEqual(formatPrice(undefined), "N/A")
  assert.strictEqual(formatPrice("invalid"), "N/A")
})

test("normalizeApiResponse handles various inputs", () => {
  // Array input
  const arr = [{ id: 1 }, { id: 2 }]
  assert.deepEqual(normalizeApiResponse(arr), arr)

  // Object with list key
  const obj = { Success: true, Items: arr }
  assert.deepEqual(normalizeApiResponse(obj, "Items"), arr)

  // Fallback key
  const txObj = { Success: true, Transactions: arr }
  assert.deepEqual(normalizeApiResponse(txObj), arr)

  // Error response
  const errObj = { Success: false, Transactions: arr }
  assert.deepEqual(normalizeApiResponse(errObj), [])

  // Single object wrap
  const single = { MyData: "val" }
  assert.deepEqual(normalizeApiResponse(single), [single])

  // Container object (should not wrap)
  const container = { Success: true, Timestamp: "..." }
  assert.deepEqual(normalizeApiResponse(container), [])

  // Invalid input
  assert.deepEqual(normalizeApiResponse(null), [])
  assert.deepEqual(normalizeApiResponse("string"), [])
})
