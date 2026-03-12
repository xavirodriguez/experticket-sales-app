import { describe, it, expect, vi } from "vitest"
import {
  get_available_products,
  check_availability_and_price,
  get_transaction_status,
  cancel_transaction,
  get_cancellation_requests,
} from "./tools"
import { experticketService } from "./service"

// Mock the experticketService
vi.mock("./service", () => ({
  experticketService: {
    getCatalog: vi.fn(),
    getCapacity: vi.fn(),
    getRealTimePrices: vi.fn(),
    listTransactions: vi.fn(),
    createCancellation: vi.fn(),
    listCancellations: vi.fn(),
    createReservation: vi.fn(),
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

  describe("cancel_transaction", () => {
    it("should call createCancellation with the provided data", async () => {
      const mockResult = { success: true, cancellationRequestId: "CR123" }
      const mockedService = experticketService.createCancellation as any
      mockedService.mockResolvedValueOnce(mockResult)

      const data = { SaleId: "S123", Reason: 4 }
      const result = await cancel_transaction(data)

      expect(mockedService).toHaveBeenCalledWith(data)
      expect(result.cancellationRequestId).toBe("CR123")
    })
  })

  describe("get_cancellation_requests", () => {
    it("should call listCancellations with SaleId filter", async () => {
      const mockResult = { success: true, requests: [{ id: "CR123" }] }
      const mockedService = experticketService.listCancellations as any
      mockedService.mockResolvedValueOnce(mockResult)

      const result = await get_cancellation_requests("S123")

      expect(mockedService).toHaveBeenCalledWith({ SaleId: "S123" })
      expect(result.requests[0].id).toBe("CR123")
    })

    it("should call listCancellations without filter if no saleId provided", async () => {
      const mockResult = { success: true, requests: [] }
      const mockedService = experticketService.listCancellations as any
      mockedService.mockResolvedValueOnce(mockResult)

      await get_cancellation_requests()

      expect(mockedService).toHaveBeenCalledWith({})
    })
  })
})
