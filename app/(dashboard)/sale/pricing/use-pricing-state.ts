/**
 * @module usePricingState
 * @description Custom hook for managing pricing state and API calls.
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { SaleState } from "../use-sale-wizard"
import type { RealTimePricesResponse } from "@/lib/experticket/types"

/**
 * Custom hook to manage the state and logic for Step 3 (Pricing).
 *
 * @param state - The current global sale state.
 * @returns An object containing pricing data, loading state, and fetch logic.
 * @example
 * ```typescript
 * const { prices, fetchPrices, loading } = usePricingState(state);
 * ```
 */
export function usePricingState(state: SaleState) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RealTimePricesResponse | undefined>(undefined)
  const [fetched, setFetched] = useState(false)

  const fetchPrices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/experticket/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProductIds: state.selectedProducts.map((p) => p.ProductId),
          StartDate: state.accessDate,
          EndDate: state.accessDate,
        }),
      })
      const json: RealTimePricesResponse = await res.json()
      setData(json)
      setFetched(true)
      if (!json.Success) {
        toast.error(json.ErrorMessage || "Failed to fetch prices")
      }
    } catch {
      toast.error("Network error fetching prices")
    } finally {
      setLoading(false)
    }
  }, [state.selectedProducts, state.accessDate])

  const prices = data?.ProductsRealTimePrices || []

  return {
    loading,
    data,
    fetched,
    prices,
    fetchPrices,
  }
}
