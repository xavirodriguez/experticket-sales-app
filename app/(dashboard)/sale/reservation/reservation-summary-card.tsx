/**
 * @module ReservationSummaryCard
 * @description Component for displaying a summary before creating a reservation.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { formatPrice } from "@/lib/experticket/utils"

/**
 * Props for the ReservationSummaryCard component.
 */
interface Props {
  /** The selected access date. */
  accessDate: string
  /** Number of unique products. */
  productsCount: number
  /** Total number of items (sum of quantities). */
  itemsCount: number
  /** Indicates if the reservation is being created. */
  loading: boolean
  /** Error message if creation failed. */
  error: string | undefined
  /** Callback to initiate reservation. */
  onAction: () => void
  /** Is warning state (low time). */
  isWarning?: boolean
  /** Total price. */
  totalPrice?: number
}

/**
 * Component for displaying a summary before creating a reservation.
 *
 * @param props - {@link Props}
 * @returns A JSX element containing the reservation summary and action button.
 * @example
 * ```tsx
 * <ReservationSummaryCard accessDate="2023-10-27" productsCount={2} itemsCount={5} onAction={create} />
 * ```
 */
export function ReservationSummaryCard({
  accessDate,
  productsCount,
  itemsCount,
  loading,
  error,
  onAction,
  isWarning,
  totalPrice,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Reservation</CardTitle>
        <CardDescription>
          Reserve the selected products before completing the transaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`rounded-md border p-3 ${isWarning ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-border"}`}>
          <p className="text-sm font-medium flex items-center gap-2">
            Reservation Summary
            {isWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Access Date: {accessDate}</li>
            <li>Products: {productsCount}</li>
            <li>Total Items: {itemsCount}</li>
            {totalPrice !== undefined && (
              <li className="mt-1 font-semibold text-foreground">
                Total Price: {formatPrice(totalPrice)}
              </li>
            )}
          </ul>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Button onClick={onAction} disabled={loading} className="w-full">
          {loading ? "Creating Reservation..." : "Create Reservation"}
        </Button>
      </CardContent>
    </Card>
  )
}
