/**
 * @module StepReservation
 * @description Step 5 of the sale process: Create a temporary reservation for selected products.
 */

"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useReservationState } from "./reservation/use-reservation-state"
import { ReservationSummaryCard } from "./reservation/reservation-summary-card"
import { ReservationDetailsCard } from "./reservation/reservation-details-card"
import type { SaleState } from "./use-sale-wizard"

/**
 * Props for the {@link StepReservation} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Callback to update the global sale state. */
  updateState: (partial: Partial<SaleState>) => void
  /** Callback to proceed to the next step. */
  onNext: () => void
  /** Callback to return to the previous step. */
  onBack: () => void
}

/**
 * Component for Step 5: Reservation.
 * Creates a reservation with the Experticket API before final confirmation.
 */
export function StepReservation({ state, updateState, onNext, onBack }: Props) {
  const {
    reservation,
    loading,
    cancelling,
    error,
    timeLeft,
    isExpired,
    isWarning,
    makeReservation,
    cancelReservation,
    resetReservationState,
  } = useReservationState(state, updateState)

  function handleNext() {
    if (!reservation?.reservationId) {
      toast.error("You must create a reservation first")
      return
    }
    if (isExpired) {
      toast.error("Reservation has expired. Please create a new one.")
      return
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      {!reservation ? (
        <ReservationSummaryCard
          accessDate={state.accessDate}
          productsCount={state.selectedProducts.length}
          itemsCount={state.selectedProducts.reduce((a, p) => a + p.quantity, 0)}
          totalPrice={state.selectedProducts.reduce((a, p) => a + (p.price || 0) * p.quantity, 0)}
          loading={loading}
          error={error}
          onAction={makeReservation}
        />
      ) : (
        <ReservationDetailsCard
          reservation={reservation}
          timeLeft={timeLeft}
          isExpired={isExpired}
          isWarning={isWarning}
          isCancelling={cancelling}
          onCancel={cancelReservation}
          onRetry={resetReservationState}
        />
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={!reservation || isExpired}>
          Next: Create Transaction
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
