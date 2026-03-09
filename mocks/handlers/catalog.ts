import { http } from "msw"
import { loadFixture } from "../utils/loadFixture"
import { jsonResponse, errorResponse } from "../utils/jsonResponse"
import { EXPERTICKET_API_BASE_URL, checkParams } from "../utils/constants"
import type { CatalogResponse, LanguagesResponse, LastUpdatedResponse } from "../../lib/experticket/types"

export const catalogHandlers = [
  // Get Catalog
  http.get(`${EXPERTICKET_API_BASE_URL}/catalog`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<CatalogResponse>("catalog/default.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Languages
  http.get(`${EXPERTICKET_API_BASE_URL}/languages`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<LanguagesResponse>("catalog/languages.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),

  // Get Last Updated
  http.get(`${EXPERTICKET_API_BASE_URL}/lastupdated`, ({ request }) => {
    const url = new URL(request.url)
    const error = checkParams(url.searchParams, ["ApiKey", "PartnerId"])
    if (error) return errorResponse(error, 400, ["MISSING_PARAMS"])

    try {
      const data = loadFixture<LastUpdatedResponse>("catalog/lastupdated.json")
      return jsonResponse(data)
    } catch (e: any) {
      return errorResponse(e.message, 500)
    }
  }),
]
