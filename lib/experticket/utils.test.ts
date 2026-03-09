import { describe, it, expect } from "vitest"
import { resolveTransactionId, formatPrice, normalizeApiResponse } from "./utils"
import type { Transaction } from "./types"

describe("utils", () => {
  it("resolveTransactionId extracts ID correctly", () => {
    const tx1: Transaction = { SaleId: "SALE123", Success: true }
    expect(resolveTransactionId(tx1)).toBe("SALE123")

    const tx2: Transaction = { TransactionId: "TX456", Success: true }
    expect(resolveTransactionId(tx2)).toBe("TX456")

    const tx3: Transaction = { Id: "ID789", Success: true }
    expect(resolveTransactionId(tx3)).toBe("ID789")

    const tx4: Transaction = { Success: true }
    expect(resolveTransactionId(tx4)).toBe("N/A")
  })

  it("formatPrice formats correctly", () => {
    expect(formatPrice(123.456)).toBe("123.46 EUR")
    expect(formatPrice("100", "USD")).toBe("100.00 USD")
    expect(formatPrice(null)).toBe("N/A")
    expect(formatPrice(undefined)).toBe("N/A")
    expect(formatPrice("invalid" as any)).toBe("N/A")
  })

  it("normalizeApiResponse handles various inputs", () => {
    // Array input
    const arr = [{ id: 1 }, { id: 2 }]
    expect(normalizeApiResponse(arr)).toEqual(arr)

    // Object with list key
    const obj = { Success: true, Items: arr }
    expect(normalizeApiResponse(obj, "Items")).toEqual(arr)

    // Fallback key
    const txObj = { Success: true, Transactions: arr }
    expect(normalizeApiResponse(txObj)).toEqual(arr)

    // Error response
    const errObj = { Success: false, Transactions: arr }
    expect(normalizeApiResponse(errObj)).toEqual([])

    // Single object wrap
    const single = { MyData: "val" }
    expect(normalizeApiResponse(single)).toEqual([single])

    // Container object (should not wrap)
    const container = { Success: true, Timestamp: "..." }
    expect(normalizeApiResponse(container)).toEqual([])

    // Invalid input
    expect(normalizeApiResponse(null)).toEqual([])
    expect(normalizeApiResponse("string" as any)).toEqual([])
  })
})
