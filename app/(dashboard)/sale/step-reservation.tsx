/**
 * @module StepReservation
 * @description Step 5 of the sale process: Create a temporary reservation in the Experticket system.
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, Trash2 } from "lucide-react"
import type { SaleState } from "./page"
import type { ReservationResponse } from "@/lib/experticket/types"
import { useCountdown } from "@/hooks/use-countdown"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { LOCAL_STORAGE_KEYS } from "@/lib/constants"

/**
 * Props for the {@link StepReservation} component.
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
 * Component for Step 5: Reservation.
 * Calls the Experticket API to block capacity for a limited time.
 *
 * @param props - {@link Props}
 *
 * @remarks
 * - Sends a `POST` request to `/api/experticket/reservation` with the products and access date.
 * - Implements a countdown timer to show when the reservation expires.
 * - Allows cancelling the reservation via a `DELETE` request.
 */
export function StepReservation({ state, updateState, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reservation, setReservation] = useState<ReservationResponse | null>(state.reservation)
  const [error, setError] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<number | null>(state.reservationExpiry)
  const [isTest] = useLocalStorage(LOCAL_STORAGE_KEYS.IS_TEST, false)

  const { timeLeft, isExpired } = useCountdown(expiresAt)

  /**
   * Creates a new reservation.
   */
  async function makeReservation() {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        IsTest: isTest,
        AccessDateTime: `${state.accessDate}T00:00:00`,
        Products: state.selectedProducts.map((p) => ({
          ProductId: p.ProductId,
          Quantity: p.quantity,
          Tickets: null,
          AccessDateTime: null,
          AccessEndDateTime: null,
        })),
        LanguageCode: state.language || null,
      }

      const res = await fetch("/api/experticket/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data: ReservationResponse = await res.json()

      if (!data.Success) {
        setError(data.ErrorMessage || "Reservation failed")
        toast.error(data.ErrorMessage || "Reservation failed")
        return
      }

      setReservation(data)

      // Set expiry countdown
      if (data.MinutesToExpiry) {
        const expiry = Date.now() + data.MinutesToExpiry * 60 * 1000
        setExpiresAt(expiry)
        updateState({ reservation: data, reservationExpiry: expiry })
      } else {
        updateState({ reservation: data, reservationExpiry: null })
      }

      toast.success(`Reservation created: ${data.ReservationId}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cancels the active reservation.
   */
  async function cancelReservation() {
    if (!reservation?.ReservationId) return
    setCancelling(true)
    try {
      const res = await fetch("/api/experticket/reservation", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IsTest: isTest,
          ReservationId: reservation.ReservationId,
        }),
      })
      const data = await res.json()
      if (data.Success) {
        toast.success("Reservation cancelled")
        setReservation(null)
        setExpiresAt(null)
        updateState({ reservation: null, reservationExpiry: null })
      } else {
        toast.error(data.ErrorMessage || "Failed to cancel reservation")
      }
    } catch {
      toast.error("Network error cancelling reservation")
    } finally {
      setCancelling(false)
    }
  }

  /**
   * Proceeds to the next step.
   */
  function handleNext() {
    if (!reservation?.ReservationId) {
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
        <Card>
          <CardHeader>
            <CardTitle>Create Reservation</CardTitle>
            <CardDescription>
              Reserve the selected products before completing the transaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-medium">Reservation Summary</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>Access Date: {state.accessDate}</li>
                <li>Products: {state.selectedProducts.length}</li>
                <li>
                  Total Items: {state.selectedProducts.reduce((a, p) => a + p.quantity, 0)}
                </li>
              </ul>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button onClick={makeReservation} disabled={loading} className="w-full">
              {loading ? "Creating Reservation..." : "Create Reservation"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Reservation Created
              <Badge variant="secondary">{reservation.ReservationId}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground">Reservation ID</p>
                <p className="font-mono text-sm font-medium">{reservation.ReservationId}</p>
              </div>
              {reservation.TotalPrice != null && (
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs text-muted-foreground">Total Price</p>
                  <p className="text-sm font-medium">{reservation.TotalPrice.toFixed(2)} EUR</p>
                </div>
              )}
              {expiresAt && (
                <div
                  className={`rounded-md border p-3 ${
                    isExpired ? "border-destructive/50 bg-destructive/10" : "border-border"
                  }`}
                >
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {timeLeft}
                  </p>
                </div>
              )}
            </div>

            {reservation.Products && reservation.Products.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Reserved Products</p>
                <div className="space-y-1">
                  {reservation.Products.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-mono text-xs">{p.ProductId}</span>
                      <span>x{p.Quantity}</span>
                      {p.Price != null && <span>{p.Price.toFixed(2)} EUR</span>}
                      <Badge variant={p.Success ? "secondary" : "destructive"}>
                        {p.Success ? "OK" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={cancelReservation}
              disabled={cancelling}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {cancelling ? "Cancelling..." : "Cancel Reservation"}
            </Button>

            {isExpired && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-medium">Reservation Expired</p>
                  <p className="text-sm">
                    Create a new reservation to proceed with the transaction.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setReservation(null)
                      setExpiresAt(null)
                      updateState({ reservation: null, reservationExpiry: null })
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
