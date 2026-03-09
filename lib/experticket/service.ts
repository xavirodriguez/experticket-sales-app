/**
 * @module experticket-service
 * @description Service layer for orchestrating Experticket API calls with validation and normalization.
 */

import { experticketFetch, getPartnerId, getDefaultLanguage } from "./server-client"
import * as schemas from "./schema"
import * as adapters from "./adapter"
import type {
  ReservationRequest,
  TransactionCreateRequest,
  CancellationRequest,
} from "./types"

/**
 * Service class for Experticket operations.
 */
export class ExperticketService {
  /**
   * Retrieves and validates the product catalog.
   */
  async getCatalog(languageCode?: string): Promise<adapters.DomainCatalog> {
    const raw = await experticketFetch("catalog", {
      params: {
        PartnerId: getPartnerId(),
        LanguageCode: languageCode || getDefaultLanguage(),
      },
    })
    const validated = schemas.CatalogResponseSchema.parse(raw)
    return adapters.adaptCatalog(validated)
  }

  /**
   * Retrieves and validates supported languages.
   */
  async getLanguages(): Promise<adapters.DomainLanguages> {
    const raw = await experticketFetch("AvailableLanguages")
    const validated = schemas.LanguagesResponseSchema.parse(raw)
    return adapters.adaptLanguages(validated)
  }

  /**
   * Retrieves and validates product tags.
   */
  async getTags(): Promise<adapters.DomainTags> {
    const raw = await experticketFetch("tags")
    const validated = schemas.TagsResponseSchema.parse(raw)
    return adapters.adaptTags(validated)
  }

  /**
   * Retrieves the system last updated date.
   */
  async getLastUpdated(): Promise<adapters.DomainLastUpdated> {
    const raw = await experticketFetch("cataloglastupdateddatetime")
    const validated = schemas.LastUpdatedResponseSchema.parse(raw)
    return adapters.adaptLastUpdated(validated)
  }

  /**
   * Checks available capacity for products/sessions.
   */
  async getCapacity(params: Record<string, any>): Promise<adapters.DomainCapacity> {
    const raw = await experticketFetch("availablecapacity", { params })
    const validated = schemas.AvailableCapacityResponseSchema.parse(raw)
    return adapters.adaptCapacity(validated)
  }

  /**
   * Calculates real-time prices.
   */
  async getRealTimePrices(body: any): Promise<adapters.DomainRealTimePrices> {
    const raw = await experticketFetch("RealTimePrices", {
      method: "POST",
      body,
    })
    const validated = schemas.RealTimePricesResponseSchema.parse(raw)
    return adapters.adaptPrices(validated)
  }

  /**
   * Checks required ticket questions.
   */
  async checkTicketQuestions(body: any): Promise<adapters.DomainTicketQuestions> {
    const raw = await experticketFetch("checkticketsquestions", {
      method: "POST",
      body,
    })
    const validated = schemas.TicketQuestionsResponseSchema.parse(raw)
    return adapters.adaptQuestions(validated)
  }

  /**
   * Creates a temporary reservation.
   */
  async createReservation(data: ReservationRequest): Promise<adapters.DomainReservation> {
    const raw = await experticketFetch("reservation", {
      method: "POST",
      body: data,
    })
    const validated = schemas.ReservationResponseSchema.parse(raw)
    return adapters.adaptReservation(validated)
  }

  /**
   * Finalizes a transaction.
   */
  async createTransaction(data: TransactionCreateRequest): Promise<adapters.DomainTransaction> {
    const raw = await experticketFetch("transaction", {
      method: "POST",
      body: data,
    })
    const validated = schemas.TransactionSchema.parse(raw)
    return adapters.adaptTransaction(validated)
  }

  /**
   * Lists transactions.
   */
  async listTransactions(params: Record<string, any>): Promise<adapters.DomainTransactionList> {
    const raw = await experticketFetch("transaction", { params })
    const validated = schemas.TransactionListResponseSchema.parse(raw)
    return adapters.adaptTransactionList(validated)
  }

  /**
   * Retrieves transaction documents.
   */
  async getDocuments(saleId: string): Promise<adapters.DomainDocuments> {
    const raw = await experticketFetch("transactiondocuments", {
      params: { id: saleId },
    })
    const validated = schemas.TransactionDocumentsResponseSchema.parse(raw)
    return adapters.adaptDocuments(validated)
  }

  /**
   * Retrieves access codes.
   */
  async getAccessCodes(saleId: string): Promise<adapters.DomainAccessCodes> {
    const raw = await experticketFetch("transactionaccesscodes", {
      params: { SaleId: saleId },
    })
    const validated = schemas.AccessCodesResponseSchema.parse(raw)
    return adapters.adaptAccessCodes(validated)
  }

  /**
   * Requests a cancellation.
   */
  async createCancellation(data: CancellationRequest): Promise<any> {
    const raw = await experticketFetch("cancellationrequest", {
      method: "POST",
      body: data,
    })
    return schemas.CancellationRequestResponseSchema.parse(raw)
  }

  /**
   * Lists cancellation requests.
   */
  async listCancellations(params: Record<string, any>): Promise<adapters.DomainCancellations> {
    const raw = await experticketFetch("cancellationrequest", { params })
    const validated = schemas.CancellationListResponseSchema.parse(raw)
    return adapters.adaptCancellations(validated)
  }
}

/**
 * Singleton instance of the ExperticketService.
 */
export const experticketService = new ExperticketService()
