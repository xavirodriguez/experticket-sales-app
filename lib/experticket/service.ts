/**
 * Service layer for orchestrating Experticket API calls with validation and normalization.
 *
 * @packageDocumentation
 */

import { experticketFetch, getPartnerId, getDefaultLanguage } from "./server-client"
import * as schemas from "./schema"
import * as adapters from "./adapter"
import type {
  ReservationRequest,
  TransactionCreateRequest,
  CancellationRequest,
  CancellationRequestResponse,
} from "./types"

/**
 * Orchestrates operations with the Experticket API.
 *
 * @remarks
 * This service handles data fetching, schema validation using Zod, and
 * normalization into domain models.
 */
export class ExperticketService {
  /**
   * Retrieves the product catalog.
   *
   * @param languageCode - Optional ISO language code for localized content.
   * @returns Normalized catalog including providers and products.
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
   * Retrieves supported languages.
   *
   * @returns List of languages supported by the platform.
   */
  async getLanguages(): Promise<adapters.DomainLanguages> {
    const raw = await experticketFetch("AvailableLanguages")
    const validated = schemas.LanguagesResponseSchema.parse(raw)
    return adapters.adaptLanguages(validated)
  }

  /**
   * Retrieves product tags.
   *
   * @returns Hierarchical tag tree for product classification.
   */
  async getTags(): Promise<adapters.DomainTags> {
    const raw = await experticketFetch("tags")
    const validated = schemas.TagsResponseSchema.parse(raw)
    return adapters.adaptTags(validated)
  }

  /**
   * Retrieves the system last updated date.
   *
   * @returns ISO 8601 timestamp of the last system update.
   */
  async getLastUpdated(): Promise<adapters.DomainLastUpdated> {
    const raw = await experticketFetch("cataloglastupdateddatetime")
    const validated = schemas.LastUpdatedResponseSchema.parse(raw)
    return adapters.adaptLastUpdated(validated)
  }

  /**
   * Checks available capacity for products or sessions.
   *
   * @param queryParams - Filter parameters for the capacity check.
   * @returns Capacity records for the requested items and dates.
   */
  async getCapacity(queryParams: Record<string, string>): Promise<adapters.DomainCapacity> {
    const raw = await experticketFetch("availablecapacity", { params: queryParams })
    const validated = schemas.AvailableCapacityResponseSchema.parse(raw)
    return adapters.adaptCapacity(validated)
  }

  /**
   * Calculates real-time prices for a selection.
   *
   * @param priceRequest - Pricing request details.
   * @returns Calculated prices and access dates.
   */
  async getRealTimePrices(priceRequest: unknown): Promise<adapters.DomainRealTimePrices> {
    const raw = await experticketFetch("RealTimePrices", {
      method: "POST",
      body: priceRequest,
    })
    const validated = schemas.RealTimePricesResponseSchema.parse(raw)
    return adapters.adaptPrices(validated)
  }

  /**
   * Checks required ticket questions for a selection.
   *
   * @param questionRequest - Question request details.
   * @returns Mandatory questions and profiles for the selection.
   */
  async checkTicketQuestions(questionRequest: unknown): Promise<adapters.DomainTicketQuestions> {
    const raw = await experticketFetch("checkticketsquestions", {
      method: "POST",
      body: questionRequest,
    })
    const validated = schemas.TicketQuestionsResponseSchema.parse(raw)
    return adapters.adaptQuestions(validated)
  }

  /**
   * Creates a temporary reservation.
   *
   * @param reservationRequest - Reservation details including products and answers.
   * @returns Reservation session details and confirmed items.
   */
  async createReservation(
    reservationRequest: ReservationRequest
  ): Promise<adapters.DomainReservation> {
    const raw = await experticketFetch("reservation", {
      method: "POST",
      body: reservationRequest,
    })
    const validated = schemas.ReservationResponseSchema.parse(raw)
    return adapters.adaptReservation(validated)
  }

  /**
   * Finalizes a transaction from a reservation.
   *
   * @param transactionRequest - Transaction details including reservation ID.
   * @returns Finalized transaction record.
   */
  async createTransaction(
    transactionRequest: TransactionCreateRequest
  ): Promise<adapters.DomainTransaction> {
    const raw = await experticketFetch("transaction", {
      method: "POST",
      body: transactionRequest,
    })
    const validated = schemas.TransactionSchema.parse(raw)
    return adapters.adaptTransaction(validated)
  }

  /**
   * Lists historical transactions.
   *
   * @param queryParams - Filter and pagination parameters.
   * @returns Paginated list of transaction records.
   */
  async listTransactions(
    queryParams: Record<string, string>
  ): Promise<adapters.DomainTransactionList> {
    const raw = await experticketFetch("transaction", { params: queryParams })
    const validated = schemas.TransactionListResponseSchema.parse(raw)
    return adapters.adaptTransactionList(validated)
  }

  /**
   * Retrieves downloadable documents for a sale.
   *
   * @param saleId - Unique identifier of the sale.
   * @returns List of document URLs and language codes.
   */
  async getDocuments(saleId: string): Promise<adapters.DomainDocuments> {
    const raw = await experticketFetch("transactiondocuments", {
      params: { id: saleId },
    })
    const validated = schemas.TransactionDocumentsResponseSchema.parse(raw)
    return adapters.adaptDocuments(validated)
  }

  /**
   * Retrieves access codes for a sale.
   *
   * @param saleId - Unique identifier of the sale.
   * @returns Access codes for all tickets in the transaction.
   */
  async getAccessCodes(saleId: string): Promise<adapters.DomainAccessCodes> {
    const raw = await experticketFetch("transactionaccesscodes", {
      params: { SaleId: saleId },
    })
    const validated = schemas.AccessCodesResponseSchema.parse(raw)
    return adapters.adaptAccessCodes(validated)
  }

  /**
   * Requests a cancellation for a sale.
   *
   * @param cancellationRequest - Cancellation details and reason.
   * @returns Result of the cancellation request.
   */
  async createCancellation(
    cancellationRequest: CancellationRequest
  ): Promise<CancellationRequestResponse> {
    const raw = await experticketFetch("cancellationrequest", {
      method: "POST",
      body: cancellationRequest,
    })
    return schemas.CancellationRequestResponseSchema.parse(raw)
  }

  /**
   * Lists cancellation requests.
   *
   * @param queryParams - Filter and pagination parameters.
   * @returns Paginated list of cancellation request items.
   */
  async listCancellations(
    queryParams: Record<string, string>
  ): Promise<adapters.DomainCancellations> {
    const raw = await experticketFetch("cancellationrequest", { params: queryParams })
    const validated = schemas.CancellationListResponseSchema.parse(raw)
    return adapters.adaptCancellations(validated)
  }
}

/**
 * Singleton instance of the ExperticketService.
 */
export const experticketService = new ExperticketService()
