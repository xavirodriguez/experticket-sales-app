import { describe, it, expect } from "vitest"
import * as adapters from "./adapter"
import type { CatalogResponse } from "./types"

describe("Experticket Adapter", () => {
  describe("adaptCatalog", () => {
    it("should adapt a raw catalog response to camelCase domain models", () => {
      const raw: CatalogResponse = {
        Success: true,
        Providers: [
          {
            ProviderId: "P1",
            ProviderName: "Test Provider",
            ProductBases: [
              {
                ProductBaseId: "PB1",
                Products: [
                  {
                    ProductId: "PR1",
                    ProductName: "Test Product",
                    Tickets: [{ TicketId: "T1" }],
                  },
                ],
              },
            ],
          },
        ],
      }

      const domain = adapters.adaptCatalog(raw)

      expect(domain.success).toBe(true)
      expect(domain.providers).toHaveLength(1)
      expect(domain.providers[0].providerId).toBe("P1")
      expect(domain.providers[0].productBases![0].products![0].productId).toBe("PR1")
      expect(domain.providers[0].productBases![0].products![0].tickets![0].ticketId).toBe("T1")
    })

    it("should handle empty providers correctly", () => {
      const raw: CatalogResponse = { Success: true, Providers: [] }
      const domain = adapters.adaptCatalog(raw)
      expect(domain.providers).toEqual([])
    })
  })

  describe("adaptCapacity", () => {
    it("should adapt capacity items to camelCase", () => {
      const raw = {
        Success: true,
        Products: [
          {
            ProductId: "PR1",
            Date: "2024-10-10",
            AvailableCapacity: 10,
          },
        ],
      }
      const domain = adapters.adaptCapacity(raw as any)
      expect(domain.products[0].productId).toBe("PR1")
      expect(domain.products[0].availableCapacity).toBe(10)
    })
  })
})
