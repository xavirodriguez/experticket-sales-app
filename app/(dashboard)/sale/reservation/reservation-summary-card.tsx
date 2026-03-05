/**
 * @module ReservationSummaryCard
 * @description Component for displaying a summary before creating a reservation.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

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
        <div className="rounded-md border border-border p-3">
          <p className="text-sm font-medium">Reservation Summary</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Access Date: {accessDate}</li>
            <li>Products: {productsCount}</li>
            <li>Total Items: {itemsCount}</li>
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
