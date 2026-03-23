/**
 * @module StepPricing
 * @description Step 3 of the sale process: Calculate and display real-time pricing.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { usePricingState } from "./pricing/use-pricing-state"
import { PricingTable } from "./pricing/pricing-table"
import { PricingContent } from "./pricing/pricing-content"
import type { SaleState } from "./use-sale-wizard"

/**
 * Props for the {@link StepPricing} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Function to update the global sale state. */
  updateState: (p: Partial<SaleState>) => void
  /** Callback to navigate to the next step. */
  onNext: () => void
  /** Callback to navigate back to the previous step. */
  onBack: () => void
}

/**
 * Component for Step 3: Pricing.
 * Fetches the most up-to-date prices from the Experticket API.
 */
export function StepPricing({ state, updateState, onNext, onBack }: Props) {
  const { loading, data, fetched, prices, fetchPrices } = usePricingState(state)

  /**
   * Proceeds to the next step, saving the pricing data.
   */
  function handleNext() {
    updateState({ pricingData: prices })
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Real-Time Pricing</CardTitle>
          <Button size="sm" variant="outline" onClick={fetchPrices} disabled={loading}>
            <RefreshCw className={`mr-1 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {fetched ? "Refresh" : "Fetch Prices"}
          </Button>
        </CardHeader>
        <CardContent>
          <PricingContent
            loading={loading}
            fetched={fetched}
            success={data?.success}
            errorMessage={data?.errorMessage ?? undefined}
          />

          <PricingTable selectedProducts={state.selectedProducts} prices={prices} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={loading || !fetched || (data !== undefined && !data.success)}>
          Next: Questions
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
