import { test } from "node:test"
import assert from "node:assert"
import {
  resolveTransactionId,
  formatPrice,
  normalizeApiResponse,
} from "./utils"

test("resolveTransactionId", async (t) => {
  await t.test("extracts SaleId", () => {
    const id = resolveTransactionId({ SaleId: "S123" })
    assert.strictEqual(id, "S123")
  })

  await t.test("extracts TransactionId if SaleId is missing", () => {
    const id = resolveTransactionId({ TransactionId: "T456" })
    assert.strictEqual(id, "T456")
  })

  await t.test("extracts Id if others are missing", () => {
    const id = resolveTransactionId({ Id: "I789" })
    assert.strictEqual(id, "I789")
  })

  await t.test("returns N/A if no ID is found", () => {
    const id = resolveTransactionId({})
    assert.strictEqual(id, "N/A")
  })
})

test("formatPrice", async (t) => {
  await t.test("formats price with default currency", () => {
    const price = formatPrice(123.456)
    assert.strictEqual(price, "123.46 EUR")
  })

  await t.test("formats price with custom currency", () => {
    const price = formatPrice(100, "USD")
    assert.strictEqual(price, "100.00 USD")
  })

  await t.test("returns N/A for null or undefined", () => {
    assert.strictEqual(formatPrice(null), "N/A")
    assert.strictEqual(formatPrice(undefined), "N/A")
  })
})

test("normalizeApiResponse", async (t) => {
  await t.test("returns empty array for invalid input", () => {
    assert.deepStrictEqual(normalizeApiResponse(null), [])
    assert.deepStrictEqual(normalizeApiResponse(undefined), [])
    assert.deepStrictEqual(normalizeApiResponse({ Success: false }), [])
  })

  await t.test("returns input if it is already an array", () => {
    const arr = [{ id: 1 }, { id: 2 }]
    assert.deepStrictEqual(normalizeApiResponse(arr), arr)
  })

  await t.test("extracts list using provided keys", () => {
    const resp = { Success: true, Items: [{ id: 1 }] }
    assert.deepStrictEqual(normalizeApiResponse(resp, "Items"), [{ id: 1 }])
  })

  await t.test("extracts list using fallback keys", () => {
    const resp = { Success: true, Transactions: [{ id: 1 }] }
    assert.deepStrictEqual(normalizeApiResponse(resp), [{ id: 1 }])
  })

  await t.test("wraps single object if not a container", () => {
    const obj = { MyData: "test" }
    assert.deepStrictEqual(normalizeApiResponse(obj), [obj])
  })

  await t.test("returns empty array for container with no list", () => {
    const resp = { Success: true, Timestamp: "now" }
    assert.deepStrictEqual(normalizeApiResponse(resp), [])
  })
})
