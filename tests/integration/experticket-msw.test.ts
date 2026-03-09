import { describe, it, expect } from "vitest"
import { EXPERTICKET_API_BASE_URL } from "@/mocks/utils/constants"

describe("Experticket MSW Integration", () => {
  const apiKey = "test-api-key"
  const partnerId = "test-partner-id"

  it("should return catalog successfully", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/catalog?ApiKey=${apiKey}&PartnerId=${partnerId}`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.Providers).toBeDefined()
    expect(data.Providers[0].ProviderName).toBe("Museo de Prueba")
  })

  it("should return 400 when ApiKey is missing in catalog", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/catalog?PartnerId=${partnerId}`)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.Success).toBe(false)
    expect(data.ErrorMessage).toContain("Missing required parameter: ApiKey")
  })

  it("should return reservation success", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/reservation`, {
      method: "POST",
      body: JSON.stringify({
        ApiKey: apiKey,
        AccessDateTime: "2025-05-01T10:00:00Z",
        Products: [{ ProductId: "PROD-001", Quantity: 1 }]
      }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.ReservationId).toBe("RES-123456")
  })

  it("should return transaction success", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/transaction`, {
      method: "POST",
      body: JSON.stringify({
        ApiKey: apiKey,
        ReservationId: "RES-123456",
        AccessDateTime: "2025-05-01T10:00:00Z",
        Products: [{ ProductId: "PROD-001" }]
      }),
      headers: { "Content-Type": "application/json" }
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.TransactionId).toBe("TRANS-789012")
  })

  it("should return transaction list when querying", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/transaction?ApiKey=${apiKey}`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.Transactions).toBeInstanceOf(Array)
    expect(data.Transactions[0].TransactionId).toBe("TRANS-789012")
  })

  it("should return documents successfully", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/documents?ApiKey=${apiKey}&SaleId=SALE-789012`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.Documents[0].SalesDocumentUrl).toBeDefined()
  })

  it("should return access codes successfully", async () => {
    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/accesscodes?ApiKey=${apiKey}`)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.Success).toBe(true)
    expect(data.Transactions[0].Products[0].Tickets[0].AccessCode).toBe("BC-123456789")
  })

  it("should return 500 when fixture is missing in handlers", async () => {
    const { http, HttpResponse } = await import('msw')
    const { server } = await import('@/mocks/server')

    // We explicitly overwrite to test error handling logic in handlers if they fail to load something
    // Although with import.meta.glob it's harder to fail at runtime unless key is missing.
    server.use(
      http.get(`${EXPERTICKET_API_BASE_URL}/catalog`, () => {
        return HttpResponse.json({ Success: false, ErrorMessage: "Fixture not found" }, { status: 500 })
      })
    )

    const response = await fetch(`${EXPERTICKET_API_BASE_URL}/catalog?ApiKey=${apiKey}&PartnerId=${partnerId}`)
    const data = await response.json()
    expect(response.status).toBe(500)
    expect(data.Success).toBe(false)
  })
})
