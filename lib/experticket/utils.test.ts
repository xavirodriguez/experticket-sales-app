import test from "node:test"
import assert from "node:assert/strict"
import {
  resolveTransactionId,
  formatPrice,
  normalizeApiResponse,
} from "./utils.js"

test("resolveTransactionId should resolve ID from various keys", () => {
  assert.strictEqual(resolveTransactionId({ SaleId: "S123" }), "S123")
  assert.strictEqual(resolveTransactionId({ TransactionId: "T456" }), "T456")
  assert.strictEqual(resolveTransactionId({ Id: "I789" }), "I789")
  assert.strictEqual(resolveTransactionId({ SaleId: "S123", TransactionId: "T456" }), "S123")
  assert.strictEqual(resolveTransactionId({}), "N/A")
})

test("formatPrice should format numbers correctly", () => {
  assert.strictEqual(formatPrice(123.456), "123.46 EUR")
  assert.strictEqual(formatPrice(10, "USD"), "10.00 USD")
  assert.strictEqual(formatPrice(0), "0.00 EUR")
})

test("formatPrice should handle null/undefined", () => {
  assert.strictEqual(formatPrice(null), "N/A")
  assert.strictEqual(formatPrice(undefined), "N/A")
})

test("normalizeApiResponse should return empty array for invalid input", () => {
  assert.deepStrictEqual(normalizeApiResponse(null), [])
  assert.deepStrictEqual(normalizeApiResponse(undefined), [])
  assert.deepStrictEqual(normalizeApiResponse("not an object"), [])
  assert.deepStrictEqual(normalizeApiResponse({ Success: false }), [])
})

test("normalizeApiResponse should return array if input is array", () => {
  const input = [{ id: 1 }, { id: 2 }]
  assert.deepStrictEqual(normalizeApiResponse(input), input)
})

test("normalizeApiResponse should find list by provided keys", () => {
  const data = { MyList: [{ id: 1 }] }
  assert.deepStrictEqual(normalizeApiResponse(data, "MyList"), [{ id: 1 }])
  assert.deepStrictEqual(normalizeApiResponse(data, ["NonExistent", "MyList"]), [{ id: 1 }])
})

test("normalizeApiResponse should find list by fallback keys", () => {
  assert.deepStrictEqual(normalizeApiResponse({ Transactions: [1, 2] }), [1, 2])
  assert.deepStrictEqual(normalizeApiResponse({ Documents: [3] }), [3])
})

test("normalizeApiResponse should wrap single object if not a container", () => {
  const item = { Foo: "Bar" }
  assert.deepStrictEqual(normalizeApiResponse(item), [item])
})

test("normalizeApiResponse should not wrap container objects", () => {
  assert.deepStrictEqual(normalizeApiResponse({ Success: true }), [])
})
