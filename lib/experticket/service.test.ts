import { describe, it, expect, vi } from "vitest"
import { experticketService } from "./service"
import * as fetchModule from "./server-client"

// Mock the experticketFetch function
vi.mock("./server-client", async () => {
  const actual = await vi.importActual<typeof fetchModule>("./server-client")
  return {
    ...actual,
    experticketFetch: vi.fn(),
  }
})

describe("ExperticketService", () => {
  describe("getCatalog", () => {
    it("should fetch, validate, and adapt the catalog", async () => {
      const rawCatalog = {
        Success: true,
        Providers: [
          {
            ProviderId: "P1",
            ProviderName: "Test Provider",
          },
        ],
      }

      const mockedFetch = fetchModule.experticketFetch as any
      mockedFetch.mockResolvedValueOnce(rawCatalog)

      const result = await experticketService.getCatalog("es")

      expect(mockedFetch).toHaveBeenCalledWith("catalog", expect.objectContaining({
        params: expect.objectContaining({ LanguageCode: "es" })
      }))

      expect(result.success).toBe(true)
      expect(result.providers).toHaveLength(1)
      expect(result.providers[0].providerId).toBe("P1")
    })

    it("should throw a Zod validation error if raw response is invalid", async () => {
      const invalidRaw = { Success: "should-be-boolean" }
      const mockedFetch = fetchModule.experticketFetch as any
      mockedFetch.mockResolvedValueOnce(invalidRaw)

      await expect(experticketService.getCatalog()).rejects.toThrow()
    })
  })

  describe("getCapacity", () => {
    it("should fetch, validate, and adapt capacity", async () => {
      const rawCapacity = {
        Success: true,
        Products: [{ ProductId: "PR1", Date: "2024-10-10", AvailableCapacity: 5 }]
      }
      const mockedFetch = fetchModule.experticketFetch as any
      mockedFetch.mockResolvedValueOnce(rawCapacity)

      const result = await experticketService.getCapacity({ ProductIds: "PR1" })

      expect(result.success).toBe(true)
      expect(result.products[0].productId).toBe("PR1")
      expect(result.products[0].availableCapacity).toBe(5)
    })
  })
})
