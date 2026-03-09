import { describe, it, expect, vi } from "vitest"
import {
  get_available_products,
  check_availability_and_price,
  get_transaction_status,
} from "./tools"
import { experticketService } from "./service"

// Mock the experticketService
vi.mock("./service", () => ({
  experticketService: {
    getCatalog: vi.fn(),
    getCapacity: vi.fn(),
    getRealTimePrices: vi.fn(),
    listTransactions: vi.fn(),
  },
}))

describe("Experticket AI Tools", () => {
  describe("get_available_products", () => {
    it("should call the service and return a normalized catalog", async () => {
      const mockCatalog = { success: true, providers: [{ providerId: "P1" }] }
      const mockedService = experticketService.getCatalog as any
      mockedService.mockResolvedValueOnce(mockCatalog)

      const result = await get_available_products("es")

      expect(mockedService).toHaveBeenCalledWith("es")
      expect(result.providers[0].providerId).toBe("P1")
    })
  })

  describe("check_availability_and_price", () => {
    it("should call both capacity and price services and aggregate results", async () => {
      const mockCapacity = { success: true, products: [{ productId: "PR1", availableCapacity: 10 }] }
      const mockPricing = { success: true, prices: [{ productId: "PR1", price: 25.50 }] }

      const mockedServiceCapacity = experticketService.getCapacity as any
      const mockedServicePricing = experticketService.getRealTimePrices as any

      mockedServiceCapacity.mockResolvedValueOnce(mockCapacity)
      mockedServicePricing.mockResolvedValueOnce(mockPricing)

      const result = await check_availability_and_price(["PR1"], ["2024-10-10"])

      expect(mockedServiceCapacity).toHaveBeenCalledWith({ ProductIds: "PR1", Dates: "2024-10-10" })
      expect(mockedServicePricing).toHaveBeenCalledWith({
        AccessDateTime: "2024-10-10",
        Products: [{ ProductId: "PR1" }],
      })

      expect(result.capacity.products[0].productId).toBe("PR1")
      expect(result.pricing.prices[0].price).toBe(25.50)
    })
  })

  describe("get_transaction_status", () => {
    it("should call the transaction list service with SaleId", async () => {
      const mockTransactions = { success: true, transactions: [{ saleId: "S1" }] }
      const mockedService = experticketService.listTransactions as any
      mockedService.mockResolvedValueOnce(mockTransactions)

      const result = await get_transaction_status("S1")

      expect(mockedService).toHaveBeenCalledWith({ SaleId: "S1" })
      expect(result.transactions[0].saleId).toBe("S1")
    })
  })
})
