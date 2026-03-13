import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL } from "../utils/constants"
import { adaptCatalog, adaptLanguages, adaptLastUpdated } from "../../lib/experticket/adapter"
import type { CatalogResponse, LanguagesResponse, LastUpdatedResponse } from "../../lib/experticket/types"

export const catalogHandlers = [
  // Upstream handlers (for server-side/tests)
  http.get(`${EXPERTICKET_API_BASE_URL}/catalog`, ({ request }) => {
    const url = new URL(request.url)
    if (!url.searchParams.get("PartnerId")) return errorResponse("Missing required parameter: PartnerId", 400)
    try {
      const data = loadFixture<CatalogResponse>("catalog/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get(`${EXPERTICKET_API_BASE_URL}/AvailableLanguages`, () => {
    try {
      const data = loadFixture<LanguagesResponse>("catalog/languages.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get(`${EXPERTICKET_API_BASE_URL}/cataloglastupdateddatetime`, () => {
    try {
      const data = loadFixture<LastUpdatedResponse>("catalog/lastupdated.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Internal Proxy handlers (for browser-side development)
  http.get("/api/experticket/catalog", () => {
    try {
      const raw = loadFixture<CatalogResponse>("catalog/default.json")
      return jsonResponse(adaptCatalog(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/languages", () => {
    try {
      const raw = loadFixture<LanguagesResponse>("catalog/languages.json")
      return jsonResponse(adaptLanguages(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
  http.get("/api/experticket/lastupdated", () => {
    try {
      const raw = loadFixture<LastUpdatedResponse>("catalog/lastupdated.json")
      return jsonResponse(adaptLastUpdated(raw))
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
