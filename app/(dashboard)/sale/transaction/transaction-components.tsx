/**
 * @module TransactionComponents
 * @description Small UI components for the Step 6 (Transaction) wizard.
 */

/**
 * Props for the TransactionSummary component.
 */
interface SummaryProps {
  reservationId?: string
  accessDate: string
  productsCount: number
  itemsCount: number
  totalPrice?: number
}

/**
 * Component for displaying a summary of the transaction before finalization.
 *
 * @param props - {@link SummaryProps}
 * @returns A JSX element.
 */
export function TransactionSummary({
  reservationId,
  accessDate,
  productsCount,
  itemsCount,
  totalPrice,
}: SummaryProps) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-sm font-medium">Transaction Summary</p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        <li>Reservation: {reservationId || "N/A"}</li>
        <li>Access Date: {accessDate}</li>
        <li>Products: {productsCount}</li>
        <li>Total Items: {itemsCount}</li>
        {totalPrice != null && <li>Total: {totalPrice.toFixed(2)} EUR</li>}
      </ul>
    </div>
  )
}
