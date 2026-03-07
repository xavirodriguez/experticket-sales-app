/**
 * @module useCapacityState
 * @description Custom hook for managing capacity state in the sale wizard.
 */

import useSWR from "swr"
import { fetcher } from "@/lib/experticket/client"
import type { SaleState } from "../use-sale-wizard"
import type { AvailableCapacityResponse, CapacityItem } from "@/lib/experticket/types"

/**
 * Custom hook to manage the state and logic for Step 2 (Capacity).
 *
 * @param state - The current global sale state.
 * @returns An object containing capacity data, loading state, and validation logic.
 * @example
 * ```typescript
 * const { capacityItems, hasCapacity } = useCapacityState(state);
 * ```
 */
export function useCapacityState(state: SaleState) {
  const params = new URLSearchParams({
    ProductIds: state.selectedProducts.map((p) => p.ProductId).join(","),
    Dates: state.accessDate,
    IncludePrices: "true",
  })

  const { data, isLoading, error } = useSWR<AvailableCapacityResponse>(
    `/api/experticket/capacity?${params.toString()}`,
    fetcher
  )

  const capacityItems = resolveCapacityItems(data)
  const hasCapacity = checkHasCapacity(capacityItems)

  return {
    data,
    capacityItems,
    isLoading,
    error,
    hasCapacity,
  }
}

/**
 * Normalizes the capacity data into a single array of items.
 *
 * @param data - The raw API response.
 * @returns An array of capacity items.
 */
function resolveCapacityItems(data?: AvailableCapacityResponse): CapacityItem[] {
  return [
    ...(data?.ProductBases || []),
    ...(data?.Products || []),
    ...(data?.Sessions || []),
  ]
}

/**
 * Checks if all selected items have available capacity.
 *
 * @param items - The list of capacity items to check.
 * @returns True if all items have capacity or unlimited capacity.
 */
function checkHasCapacity(items: CapacityItem[]): boolean {
  if (items.length === 0) return true
  return items.every((c) => c.AvailableCapacity === undefined || c.AvailableCapacity > 0)
}
