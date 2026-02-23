import { test } from "node:test"
import assert from "node:assert"
import { normalizeApiResponse, getTransactionId, formatCurrency } from "./utils"

test("normalizeApiResponse should handle null/undefined", () => {
  assert.deepStrictEqual(normalizeApiResponse(null), [])
  assert.deepStrictEqual(normalizeApiResponse(undefined), [])
})

test("normalizeApiResponse should handle Success: false", () => {
  assert.deepStrictEqual(normalizeApiResponse({ Success: false }), [])
})

test("normalizeApiResponse should handle arrays", () => {
  const input = [{ id: 1 }, { id: 2 }]
  assert.deepStrictEqual(normalizeApiResponse(input), input)
})

test("normalizeApiResponse should handle object with listKey", () => {
  const input = { Success: true, Transactions: [{ id: 1 }] }
  assert.deepStrictEqual(normalizeApiResponse(input, "Transactions"), [{ id: 1 }])
})

test("normalizeApiResponse should handle fallbacks", () => {
  const input = { Success: true, Documents: [{ id: 1 }] }
  assert.deepStrictEqual(normalizeApiResponse(input), [{ id: 1 }])
})

test("normalizeApiResponse should wrap single object", () => {
  const input = { Success: true, MyData: "hello" }
  assert.deepStrictEqual(normalizeApiResponse(input), [input])
})

test("getTransactionId should extract ID from various fields", () => {
  assert.strictEqual(getTransactionId({ SaleId: "S1" }), "S1")
  assert.strictEqual(getTransactionId({ TransactionId: "T1" }), "T1")
  assert.strictEqual(getTransactionId({ Id: "I1" }), "I1")
  assert.strictEqual(getTransactionId({}), "N/A")
})

test("formatCurrency should format correctly", () => {
  assert.strictEqual(formatCurrency({ TotalPrice: 10, Currency: "EUR" }), "10.00 EUR")
  assert.strictEqual(formatCurrency({ TotalAmount: 15.5 }), "15.50 EUR")
  assert.strictEqual(formatCurrency({ Price: 20, Currency: "USD" }), "20.00 USD")
  assert.strictEqual(formatCurrency({}), "N/A")
})
