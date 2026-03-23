/**
 * @module useReservationState
 * @description Custom hook for managing reservation state, timers, and API actions.
 */

import { useState, useCallback } from "react"
import { toast } from "sonner"
import { apiFetch } from "@/lib/experticket/client"
import { getIsTestMode } from "@/lib/experticket/storage"
import { useCountdown } from "@/hooks/use-countdown"
import type { SaleState } from "../use-sale-wizard"
import type { DomainReservation } from "@/lib/experticket/adapter"

/**
 * Custom hook to manage reservation-related actions.
 * @internal
 */
function useReservationActions(updateState: (partial: Partial<SaleState>) => void) {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const handleReservationError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : "Network error"
    setError(msg)
    toast.error(msg)
  }, [])

  const resetState = useCallback(() => {
    updateState({ reservation: undefined, reservationExpiry: undefined })
  }, [updateState])

  return { loading, setLoading, cancelling, setCancelling, error, setError, handleReservationError, resetState }
}

/**
 * Custom hook to manage the state and logic for Step 5 (Reservation).
 */
export function useReservationState(state: SaleState, updateState: (partial: Partial<SaleState>) => void) {
  const { loading, setLoading, cancelling, setCancelling, error, setError, handleReservationError, resetState } = useReservationActions(updateState)
  const [reservation, setReservation] = useState<DomainReservation | undefined>(state.reservation)
  const [expiresAt, setExpiresAt] = useState<number | undefined>(state.reservationExpiry)
  const { timeLeft, isExpired, isWarning } = useCountdown(expiresAt ?? null)

  const makeReservation = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const data = await executeReservationRequest(buildReservationPayload(state))
      setReservation(data)
      handleReservationSuccess(data, setExpiresAt, updateState)
      toast.success(`Reservation created: ${data.reservationId}`)
    } catch (err) {
      handleReservationError(err)
    } finally {
      setLoading(false)
    }
  }, [state, updateState, handleReservationError, setLoading, setError])

  const cancelReservation = useCallback(async () => {
    if (!reservation?.reservationId) return
    setCancelling(true)
    try {
      const data = await executeCancellationRequest(reservation.reservationId)
      if (!data.success) return toast.error(data.errorMessage || "Failed to cancel")
      toast.success("Reservation cancelled")
      setReservation(undefined)
      setExpiresAt(undefined)
      resetState()
    } catch {
      toast.error("Network error cancelling reservation")
    } finally {
      setCancelling(false)
    }
  }, [reservation?.reservationId, resetState, setCancelling])

  return { reservation, loading, cancelling, error, timeLeft, isExpired, isWarning, makeReservation, cancelReservation, resetReservationState: resetState }
}

/**
 * Builds the payload for the reservation API request.
 */
function buildReservationPayload(state: SaleState) {
  return {
    IsTest: getIsTestMode(),
    AccessDateTime: `${state.accessDate}T00:00:00`,
    AccessEndDateTime: state.accessEndDate ? `${state.accessEndDate}T23:59:59` : undefined,
    Products: state.selectedProducts.map((p) => ({
      ProductId: p.productId,
      Quantity: p.quantity,
      Tickets: p.tickets
        ? Array.from({ length: p.quantity }).flatMap(() =>
            p.tickets!.map((t) => ({
              TicketId: t.ticketId,
              SessionId: state.sessionId,
              AccessDateTime: `${state.accessDate}T00:00:00`,
              Questions: t.ticketQuestionsProfileId
                ? Object.entries(state.questionAnswers)
                    .map(([qId, val]) => ({
                      TicketQuestionId: qId,
                      StringValue: String(val),
                    }))
                : undefined,
            }))
          )
        : undefined,
    })),
    LanguageCode: state.language || undefined,
  }
}

/**
 * Executes the reservation request to the API.
 */
async function executeReservationRequest(payload: unknown): Promise<DomainReservation> {
  const res = await apiFetch("/api/experticket/reservation", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  const data: DomainReservation = await res.json()
  if (!data.success) throw new Error(data.errorMessage || "Reservation failed")
  return data
}

/**
 * Executes the cancellation request to the API.
 */
async function executeCancellationRequest(reservationId: string) {
  const res = await apiFetch("/api/experticket/reservation", {
    method: "DELETE",
    body: JSON.stringify({ IsTest: getIsTestMode(), ReservationId: reservationId }),
  })
  return res.json()
}

/**
 * Handles a successful reservation response, updating the timer and global state.
 */
function handleReservationSuccess(
  data: DomainReservation,
  setExpiresAt: (val: number | undefined) => void,
  updateState: (partial: Partial<SaleState>) => void
) {
  const expiry = data.minutesToExpiry ? Date.now() + data.minutesToExpiry * 60 * 1000 : undefined
  setExpiresAt(expiry)
  updateState({ reservation: data, reservationExpiry: expiry })
}
