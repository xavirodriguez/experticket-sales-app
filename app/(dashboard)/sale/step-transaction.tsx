/**
 * @module StepTransaction
 * @description Final step of the sale process: Confirm the transaction and finalize the sale.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { useTransactionState } from "./transaction/use-transaction-state"
import { SaleSuccessScreen } from "./transaction/sale-success-screen"
import { TransactionSummary } from "./transaction/transaction-components"
import type { SaleState } from "./use-sale-wizard"

/**
 * Props for the {@link StepTransaction} component.
 */
interface Props {
  /** Current global sale state. */
  state: SaleState
  /** Callback to reset the sale wizard to Step 1. */
  onReset: () => void
}

/**
 * Component for Step 6: Transaction.
 * Converts the active reservation into a finalized transaction.
 */
export function StepTransaction({ state, onReset }: Props) {
  const {
    loading,
    transaction,
    error,
    paymentRef,
    setPaymentRef,
    createTransaction,
  } = useTransactionState(state)

  if (transaction) {
    return <SaleSuccessScreen transaction={transaction} onReset={onReset} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Transaction</CardTitle>
          <CardDescription>
            Confirm the reservation to finalize the sale and generate tickets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionSummary
            reservationId={state.reservation?.ReservationId}
            accessDate={state.accessDate}
            productsCount={state.selectedProducts.length}
            itemsCount={state.selectedProducts.reduce((a, p) => a + p.quantity, 0)}
            totalPrice={state.reservation?.TotalPrice}
          />

          <div className="space-y-2">
            <Label htmlFor="paymentRef">Payment Reference (optional)</Label>
            <Input
              id="paymentRef"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. your internal order ID"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={createTransaction} disabled={loading}>
            {loading ? "Creating Transaction..." : "Confirm & Create Transaction"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
