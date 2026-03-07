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
import type { ReservationResponse } from "@/lib/experticket/types"

/**
 * Custom hook to manage the state and logic for Step 5 (Reservation).
 *
 * @param state - The current global sale state.
 * @param updateState - Function to update the global sale state.
 * @returns An object containing reservation state, loading states, and action handlers.
 * @example
 * ```typescript
 * const { reservation, makeReservation, cancelReservation } = useReservationState(state, update);
 * ```
 */
export function useReservationState(
  state: SaleState,
  updateState: (partial: Partial<SaleState>) => void
) {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reservation, setReservation] = useState<ReservationResponse | undefined>(
    state.reservation
  )
  const [error, setError] = useState<string | undefined>(undefined)
  const [expiresAt, setExpiresAt] = useState<number | undefined>(state.reservationExpiry)

  const { timeLeft, isExpired } = useCountdown(expiresAt ?? null)

  const resetReservationState = useCallback(() => {
    setReservation(undefined)
    setExpiresAt(undefined)
    updateState({ reservation: undefined, reservationExpiry: undefined })
  }, [updateState])

  const makeReservation = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const payload = buildReservationPayload(state)
      const res = await apiFetch("/api/experticket/reservation", {
        method: "POST",
        body: JSON.stringify(payload),
      })
      const data: ReservationResponse = await res.json()

      if (!data.Success) {
        throw new Error(data.ErrorMessage || "Reservation failed")
      }

      setReservation(data)
      handleReservationSuccess(data, setExpiresAt, updateState)
      toast.success(`Reservation created: ${data.ReservationId}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [state, updateState])

  const cancelReservation = useCallback(async () => {
    if (!reservation?.ReservationId) return
    setCancelling(true)
    try {
      const res = await apiFetch("/api/experticket/reservation", {
        method: "DELETE",
        body: JSON.stringify({
          IsTest: getIsTestMode(),
          ReservationId: reservation.ReservationId,
        }),
      })
      const data = await res.json()
      if (data.Success) {
        toast.success("Reservation cancelled")
        resetReservationState()
      } else {
        toast.error(data.ErrorMessage || "Failed to cancel reservation")
      }
    } catch {
      toast.error("Network error cancelling reservation")
    } finally {
      setCancelling(false)
    }
  }, [reservation?.ReservationId, resetReservationState])

  return {
    reservation,
    loading,
    cancelling,
    error,
    timeLeft,
    isExpired,
    makeReservation,
    cancelReservation,
    resetReservationState,
  }
}

/**
 * Builds the payload for the reservation API request.
 *
 * @param state - The current sale state.
 * @returns The request payload.
 */
function buildReservationPayload(state: SaleState) {
  return {
    IsTest: getIsTestMode(),
    AccessDateTime: `${state.accessDate}T00:00:00`,
    Products: state.selectedProducts.map((p) => ({
      ProductId: p.ProductId,
      Quantity: p.quantity,
      Tickets: undefined,
      AccessDateTime: undefined,
      AccessEndDateTime: undefined,
    })),
    LanguageCode: state.language || undefined,
  }
}

/**
 * Handles a successful reservation response, updating the timer and global state.
 *
 * @param data - The API response data.
 * @param setExpiresAt - Local state setter for expiry timestamp.
 * @param updateState - Global state update function.
 */
function handleReservationSuccess(
  data: ReservationResponse,
  setExpiresAt: (val: number | undefined) => void,
  updateState: (partial: Partial<SaleState>) => void
) {
  if (data.MinutesToExpiry) {
    const expiry = Date.now() + data.MinutesToExpiry * 60 * 1000
    setExpiresAt(expiry)
    updateState({ reservation: data, reservationExpiry: expiry })
  } else {
    updateState({ reservation: data, reservationExpiry: undefined })
  }
}
