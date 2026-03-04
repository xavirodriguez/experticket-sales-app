/**
 * @module ReservationDetailsCard
 * @description Component for displaying the details of an active reservation.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Trash2 } from "lucide-react"
import type { ReservationResponse } from "@/lib/experticket/types"

/**
 * Props for the ReservationDetailsCard component.
 */
interface Props {
  /** The reservation data returned by the API. */
  reservation: ReservationResponse
  /** The formatted time remaining for the reservation. */
  timeLeft: string
  /** Indicates if the reservation has expired. */
  isExpired: boolean
  /** Indicates if a cancellation request is in progress. */
  isCancelling: boolean
  /** Callback function to cancel the reservation. */
  onCancel: () => void
  /** Callback function to reset the reservation state (e.g., after expiry). */
  onRetry: () => void
}

/**
 * Component for displaying the details of an active reservation.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the reservation details and actions.
 * @example
 * ```tsx
 * <ReservationDetailsCard reservation={data} timeLeft="09:59" isExpired={false} onCancel={cancel} />
 * ```
 */
export function ReservationDetailsCard({
  reservation,
  timeLeft,
  isExpired,
  isCancelling,
  onCancel,
  onRetry,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Reservation Created
          <Badge variant="secondary">{reservation.ReservationId}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReservationIdItem id={reservation.ReservationId} />
          {reservation.TotalPrice != null && (
            <TotalPriceItem price={reservation.TotalPrice} />
          )}
          <TimerItem timeLeft={timeLeft} isExpired={isExpired} />
        </div>

        <ReservedProductsList products={reservation.Products || []} />

        <Button
          variant="destructive"
          size="sm"
          onClick={onCancel}
          disabled={isCancelling}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          {isCancelling ? "Cancelling..." : "Cancel Reservation"}
        </Button>

        {isExpired && <ExpiredAlert onRetry={onRetry} />}
      </CardContent>
    </Card>
  )
}

function ReservationIdItem({ id }: { id?: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">Reservation ID</p>
      <p className="font-mono text-sm font-medium">{id}</p>
    </div>
  )
}

function TotalPriceItem({ price }: { price: number }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">Total Price</p>
      <p className="text-sm font-medium">{price.toFixed(2)} EUR</p>
    </div>
  )
}

function TimerItem({ timeLeft, isExpired }: { timeLeft: string; isExpired: boolean }) {
  return (
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
  )
}

function ReservedProductsList({ products }: { products: ReservationResponse["Products"] }) {
  if (!products || products.length === 0) return undefined

  return (
    <div>
      <p className="mb-2 text-sm font-medium">Reserved Products</p>
      <div className="space-y-1">
        {products.map((p, i) => (
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
  )
}

function ExpiredAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-medium">Reservation Expired</p>
        <p className="text-sm">Create a new reservation to proceed with the transaction.</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    </div>
  )
}
