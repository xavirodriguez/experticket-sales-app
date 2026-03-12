/**
 * Service layer for orchestrating Experticket API calls with validation and normalization.
 *
 * @packageDocumentation
 */

import {
  experticketFetch,
  getPartnerId,
  getDefaultLanguage,
  getApiKey,
} from "./server-client"
import * as schemas from "./schema"
import * as adapters from "./adapter"
import type {
  ExperticketBaseResponse,
  ReservationRequest,
  TransactionCreateRequest,
  CancellationRequest,
  CancellationRequestResponse,
  RealTimePriceRequest,
  TicketQuestionRequest,
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
   * Retrieves the product catalog including providers and products.
   *
   * @param languageCode - Optional ISO language code for localized content.
   * @returns A promise that resolves to the normalized catalog.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails or the response is invalid.
   *
   * @example
   * ```typescript
   * const catalog = await experticketService.getCatalog("en");
   * ```
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
   * Retrieves the list of languages supported by the Experticket platform.
   *
   * @returns A promise that resolves to the supported languages.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   */
  async getLanguages(): Promise<adapters.DomainLanguages> {
    const raw = await experticketFetch("AvailableLanguages")
    const validated = schemas.LanguagesResponseSchema.parse(raw)
    return adapters.adaptLanguages(validated)
  }

  /**
   * Retrieves the hierarchical tag tree for product classification.
   *
   * @returns A promise that resolves to the tag tree.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   */
  async getTags(): Promise<adapters.DomainTags> {
    const raw = await experticketFetch("tags")
    const validated = schemas.TagsResponseSchema.parse(raw)
    return adapters.adaptTags(validated)
  }

  /**
   * Retrieves the timestamp of the last system-wide catalog update.
   *
   * @returns A promise that resolves to the last update timestamp.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   */
  async getLastUpdated(): Promise<adapters.DomainLastUpdated> {
    const raw = await experticketFetch("cataloglastupdateddatetime")
    const validated = schemas.LastUpdatedResponseSchema.parse(raw)
    return adapters.adaptLastUpdated(validated)
  }

  /**
   * Checks available capacity and pricing for products or sessions.
   *
   * @remarks
   * Use this method to verify if a selection is bookable for specific dates.
   *
   * @param queryParams - Filter parameters such as `ProductIds` and `Dates`.
   * @returns A promise that resolves to the capacity records.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   *
   * @example
   * ```typescript
   * const capacity = await experticketService.getCapacity({
   *   ProductIds: "123,456",
   *   Dates: "2024-12-25"
   * });
   * ```
   */
  async getCapacity(queryParams: Record<string, string>): Promise<adapters.DomainCapacity> {
    const raw = await experticketFetch("availablecapacity", { params: queryParams })
    const validated = schemas.AvailableCapacityResponseSchema.parse(raw)
    return adapters.adaptCapacity(validated)
  }

  /**
   * Calculates real-time prices for a selection of products on a specific date.
   *
   * @param priceRequest - Detailed pricing request including products and access date.
   * @returns A promise that resolves to the calculated prices.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   *
   * @example
   * ```typescript
   * const prices = await experticketService.getRealTimePrices({
   *   AccessDateTime: "2024-12-25T10:00:00Z",
   *   Products: [{ ProductId: "123" }]
   * });
   * ```
   */
  async getRealTimePrices(
    priceRequest: RealTimePriceRequest
  ): Promise<adapters.DomainRealTimePrices> {
    const payload = {
      PartnerId: getPartnerId(),
      ...priceRequest,
    }
    const raw = await experticketFetch("RealTimePrices", {
      method: "POST",
      body: payload,
    })
    const validated = schemas.RealTimePricesResponseSchema.parse(raw)
    return adapters.adaptPrices(validated)
  }

  /**
   * Retrieves the mandatory questions required for a selection of products.
   *
   * @param questionRequest - Request containing products and access date.
   * @returns A promise that resolves to the question requirements.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   */
  async checkTicketQuestions(
    questionRequest: TicketQuestionRequest
  ): Promise<adapters.DomainTicketQuestions> {
    const payload = {
      PartnerId: getPartnerId(),
      ...questionRequest,
    }
    const raw = await experticketFetch("checkticketsquestions", {
      method: "POST",
      body: payload,
    })
    const validated = schemas.TicketQuestionsResponseSchema.parse(raw)
    return adapters.adaptQuestions(validated)
  }

  /**
   * Creates a temporary reservation to lock inventory.
   *
   * @remarks
   * Reservations typically expire after a period of time (e.g., 10 minutes)
   * if not finalized into a transaction.
   *
   * @param reservationRequest - Full details including products, quantities, and answers.
   * @returns A promise that resolves to the reservation session details.
   *
   * @throws {@link ExperticketError}
   * Thrown if inventory is unavailable or the request is invalid.
   */
  /**
   * Deletes an existing reservation.
   *
   * @param reservationId - Identifier of the reservation to be cancelled.
   * @returns A promise that resolves when the reservation is successfully deleted.
   *
   * @throws {@link ExperticketError}
   * Thrown if the reservation is not found or cannot be deleted.
   */
  async deleteReservation(reservationId: string): Promise<ExperticketBaseResponse> {
    const raw = await experticketFetch<ExperticketBaseResponse>("reservation", {
      method: "DELETE",
      body: {
        ApiKey: getApiKey(),
        ReservationId: reservationId,
      },
    })
    return schemas.ExperticketBaseResponseSchema.parse(raw)
  }

  async createReservation(
    reservationRequest: ReservationRequest
  ): Promise<adapters.DomainReservation> {
    const payload = {
      ApiKey: getApiKey(),
      ...reservationRequest,
    }
    const raw = await experticketFetch("reservation", {
      method: "POST",
      body: payload,
    })
    const validated = schemas.ReservationResponseSchema.parse(raw)
    return adapters.adaptReservation(validated)
  }

  /**
   * Finalizes a reservation into a permanent sale/transaction.
   *
   * @param transactionRequest - Request containing the reservation ID.
   * @returns A promise that resolves to the finalized transaction record.
   *
   * @throws {@link ExperticketError}
   * Thrown if the reservation has expired or payment fails.
   */
  async createTransaction(
    transactionRequest: TransactionCreateRequest
  ): Promise<adapters.DomainTransaction> {
    const payload = {
      ApiKey: getApiKey(),
      ...transactionRequest,
    }
    const raw = await experticketFetch("transaction", {
      method: "POST",
      body: payload,
    })
    const validated = schemas.TransactionSchema.parse(raw)
    return adapters.adaptTransaction(validated)
  }

  /**
   * Retrieves a paginated list of historical transactions.
   *
   * @param queryParams - Filters such as `SaleId`, `PageNumber`, and `PageSize`.
   * @returns A promise that resolves to the paginated transaction list.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
   */
  async listTransactions(
    queryParams: Record<string, string>
  ): Promise<adapters.DomainTransactionList> {
    const raw = await experticketFetch("transaction", { params: queryParams })
    const validated = schemas.TransactionListResponseSchema.parse(raw)
    return adapters.adaptTransactionList(validated)
  }

  /**
   * Retrieves downloadable documents (e.g., PDFs) for a specific sale.
   *
   * @param saleId - Unique identifier of the sale.
   * @returns A promise that resolves to the document links.
   *
   * @throws {@link ExperticketError}
   * Thrown if the sale is not found or documents are not ready.
   */
  async getDocuments(saleId: string): Promise<adapters.DomainDocuments> {
    const raw = await experticketFetch("transactiondocuments", {
      params: { id: saleId },
    })
    const validated = schemas.TransactionDocumentsResponseSchema.parse(raw)
    return adapters.adaptDocuments(validated)
  }

  /**
   * Retrieves access codes (barcodes/QRs) for all tickets in a sale.
   *
   * @param saleId - Unique identifier of the sale.
   * @returns A promise that resolves to the access code hierarchy.
   *
   * @throws {@link ExperticketError}
   * Thrown if the sale is not found.
   */
  async getAccessCodes(saleId: string): Promise<adapters.DomainAccessCodes> {
    const raw = await experticketFetch("transactionaccesscodes", {
      params: { SaleId: saleId },
    })
    const validated = schemas.AccessCodesResponseSchema.parse(raw)
    return adapters.adaptAccessCodes(validated)
  }

  /**
   * Submits a request to cancel an existing sale.
   *
   * @param cancellationRequest - Request including sale ID and reason code.
   * @returns A promise that resolves to the result of the request.
   *
   * @throws {@link ExperticketError}
   * Thrown if the sale cannot be cancelled according to its conditions.
   */
  async createCancellation(
    cancellationRequest: CancellationRequest
  ): Promise<CancellationRequestResponse> {
    const payload = {
      ApiKey: getApiKey(),
      ...cancellationRequest,
    }
    const raw = await experticketFetch("cancellationrequest", {
      method: "POST",
      body: payload,
    })
    return schemas.CancellationRequestResponseSchema.parse(raw)
  }

  /**
   * Retrieves a paginated list of cancellation requests.
   *
   * @param queryParams - Filters such as `SaleId` or pagination indexes.
   * @returns A promise that resolves to the paginated list.
   *
   * @throws {@link ExperticketError}
   * Thrown if the API request fails.
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
