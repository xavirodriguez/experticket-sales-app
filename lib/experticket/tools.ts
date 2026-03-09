/**
 * @module experticket-tools
 * @description Agentic AI tools for interacting with the Experticket API.
 *
 * @remarks
 * These tools provide a semantic interface for an LLM to assist users with
 * discovery, availability, and transaction management.
 */

import { experticketService } from "./service"
import type { ReservationRequest } from "./types"

/**
 * Consults which products are available for purchase.
 *
 * @param language - ISO 639-1 language code (default: "en").
 * @returns A promise that resolves to the normalized product catalog.
 */
export async function get_available_products(language: string = "en") {
  return await experticketService.getCatalog(language)
}

/**
 * Validates availability and calculates the total price for a selection of products on a specific date.
 *
 * @param productIds - List of product identifiers to check.
 * @param dates - List of ISO 8601 date strings to check.
 * @returns A promise that resolves to both capacity and pricing information.
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
 * Creates a temporary reservation (locks inventory).
 *
 * @remarks
 * This is a SENSITIVE tool and should be preceded by user confirmation.
 *
 * @param reservationData - The full reservation request payload.
 * @returns A promise that resolves to the reservation result.
 */
export async function create_reservation(reservationData: ReservationRequest) {
  return await experticketService.createReservation(reservationData)
}

/**
 * Consults the status of a specific transaction or sale.
 *
 * @param saleId - The unique identifier of the sale.
 * @returns A promise that resolves to the transaction details.
 */
export async function get_transaction_status(saleId: string) {
  return await experticketService.listTransactions({ SaleId: saleId })
}
