/**
 * @module experticket-tools
 * @description Agentic AI tools for interacting with the Experticket API.
 *
 * @remarks
 * These tools provide a semantic interface for an LLM to assist users with
 * discovery, availability, and transaction management.
 */

import { experticketService } from "./service"
import type { ReservationRequest, CancellationRequest } from "./types"

/**
 * Consults the catalog to find which products are available for purchase.
 *
 * @param language - ISO 639-1 language code (default: "en").
 * @returns A promise that resolves to the normalized product catalog.
 *
 * @example
 * ```typescript
 * const catalog = await get_available_products("en");
 * ```
 */
export async function get_available_products(language: string = "en") {
  return await experticketService.getCatalog(language)
}

/**
 * Validates availability and calculates the total price for a selection of products on specific dates.
 *
 * @param productIds - List of unique product identifiers to check.
 * @param dates - List of ISO 8601 date strings to check for availability.
 * @returns A promise that resolves to both capacity and pricing information.
 *
 * @example
 * ```typescript
 * const info = await check_availability_and_price(["prod1"], ["2024-12-25"]);
 * ```
 */
export async function check_availability_and_price(productIds: string[], dates: string[]) {
  const [capacity, pricing] = await Promise.all([
    experticketService.getCapacity({ ProductIds: productIds.join(","), Dates: dates.join(",") }),
    experticketService.getRealTimePrices({
      AccessDateTime: dates[0], // Using the first date as primary
      Products: productIds.map((id) => ({ ProductId: id })),
    }),
  ])

  return { capacity, pricing }
}

/**
 * Creates a temporary reservation to lock inventory.
 *
 * @remarks
 * This is a SENSITIVE tool and MUST be preceded by explicit user confirmation of the selection.
 *
 * @param reservationData - The full reservation request payload including products and answers.
 * @returns A promise that resolves to the reservation result.
 *
 * @example
 * ```typescript
 * const result = await create_reservation({ ... });
 * ```
 */
export async function create_reservation(reservationData: ReservationRequest) {
  return await experticketService.createReservation(reservationData)
}

/**
 * Consults the current status and details of a specific transaction or sale.
 *
 * @param saleId - The unique identifier of the sale to look up.
 * @returns A promise that resolves to the transaction details.
 *
 * @example
 * ```typescript
 * const status = await get_transaction_status("SALE123");
 * ```
 */
export async function get_transaction_status(saleId: string) {
  return await experticketService.listTransactions({ SaleId: saleId })
}

/**
 * Submits a request to cancel an existing transaction.
 *
 * @remarks
 * This is a SENSITIVE tool and requires human-in-the-loop (HITL) approval.
 *
 * @param cancellationData - Request including sale ID and reason code.
 * @returns A promise that resolves to the result of the cancellation request.
 *
 * @example
 * ```typescript
 * const result = await cancel_transaction({ SaleId: "S123", Reason: 4 });
 * ```
 */
export async function cancel_transaction(cancellationData: CancellationRequest) {
  return await experticketService.createCancellation(cancellationData)
}

/**
 * Retrieves a list of cancellation requests, optionally filtered by sale.
 *
 * @param saleId - Optional identifier of the sale to filter by.
 * @returns A promise that resolves to the normalized list of cancellation requests.
 *
 * @example
 * ```typescript
 * const requests = await get_cancellation_requests("S123");
 * ```
 */
export async function get_cancellation_requests(saleId?: string) {
  const query: Record<string, string> = {}
  if (saleId) query.SaleId = saleId

  return await experticketService.listCancellations(query)
}
