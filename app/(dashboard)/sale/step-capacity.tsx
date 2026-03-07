/**
 * @module StepCapacity
 * @description Step 2 of the sale process: Check availability for the selected products and date.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCapacityState } from "./capacity/use-capacity-state"
import { CapacityTable } from "./capacity/capacity-table"
import { CapacityError, NoCapacityAlert } from "./capacity/capacity-alerts"
import { CapacitySkeleton, NoRestrictions } from "./capacity/capacity-components"
import type { SaleState } from "./use-sale-wizard"

/**
 * Props for the {@link StepCapacity} component.
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
 * Component for Step 2: Capacity.
 * Checks for availability restrictions on the selected products.
 */
export function StepCapacity({ state, updateState, onNext, onBack }: Props) {
  const { data, capacityItems, isLoading, error, hasCapacity } = useCapacityState(state)

  /**
   * Saves the capacity data to global state and proceeds to the next step.
   */
  function handleNext() {
    updateState({ capacityData: capacityItems })
    onNext()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CapacitySkeleton />
          ) : error || (data && !data.Success) ? (
            <CapacityError message={data?.ErrorMessage || "Network error"} />
          ) : capacityItems.length === 0 ? (
            <NoRestrictions accessDate={state.accessDate} />
          ) : (
            <CapacityTable items={capacityItems} />
          )}

          {!hasCapacity && <NoCapacityAlert />}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!hasCapacity}>
          Next: Pricing
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
