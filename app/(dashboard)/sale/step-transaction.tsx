"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  QrCode,
  RotateCcw,
} from "lucide-react"
import type { SaleState } from "./page"
import type { Transaction } from "@/lib/experticket/types"

interface Props {
  state: SaleState
  onReset: () => void
}

export function StepTransaction({ state, onReset }: Props) {
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(state.transaction)
  const [error, setError] = useState<string | null>(null)
  const [paymentRef, setPaymentRef] = useState("")

  async function createTransaction() {
    if (!state.reservation?.ReservationId) {
      toast.error("No valid reservation found")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const isTest =
        typeof window !== "undefined"
          ? localStorage.getItem("experticket_is_test") === "true"
          : false

      const payload: Record<string, unknown> = {
        IsTest: isTest,
        ReservationId: state.reservation.ReservationId,
        AccessDateTime: `${state.accessDate}T00:00:00`,
        Products: state.selectedProducts.map((p) => ({
          ProductId: p.ProductId,
        })),
      }

      if (paymentRef.trim()) {
        payload.PartnerSaleId = paymentRef.trim()
      }

      const res = await fetch("/api/experticket/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.Success === false) {
        setError(data.ErrorMessage || "Transaction creation failed")
        toast.error(data.ErrorMessage || "Transaction creation failed")
        return
      }

      setTransaction(data)
      toast.success(`Transaction created: ${data.SaleId || data.TransactionId || "OK"}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error"
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (transaction) {
    const saleId = transaction.SaleId || transaction.TransactionId || ""
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-2xl font-bold text-foreground">Sale Complete!</h2>
            <p className="text-muted-foreground">
              Transaction ID: <span className="font-mono font-semibold">{saleId}</span>
            </p>
            {transaction.TotalPrice != null && (
              <p className="text-lg font-semibold">{transaction.TotalPrice.toFixed(2)} EUR</p>
            )}
          </CardContent>
        </Card>

        {/* Product details */}
        {transaction.Products && transaction.Products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transaction.Products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {p.ProductName || p.ProductId}
                      </p>
                      {p.AccessCode && (
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          Access: {p.AccessCode}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.Price != null && (
                        <span className="text-sm font-medium">
                          {p.Price.toFixed(2)} EUR
                        </span>
                      )}
                      <Badge variant={p.Status === 1 || p.Status === undefined ? "secondary" : "destructive"}>
                        {p.Status === 1 || p.Status === undefined ? "OK" : `Status ${p.Status}`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(`/documents?txId=${saleId}`, "_self")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Documents
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/codes?txId=${saleId}`, "_self")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              View Access Codes
            </Button>
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          {/* Summary */}
          <div className="rounded-md border border-border p-3">
            <p className="text-sm font-medium">Transaction Summary</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Reservation: {state.reservation?.ReservationId || "N/A"}</li>
              <li>Access Date: {state.accessDate}</li>
              <li>Products: {state.selectedProducts.length}</li>
              <li>Total Items: {state.selectedProducts.reduce((a, p) => a + p.quantity, 0)}</li>
              {state.reservation?.TotalPrice != null && (
                <li>Total: {state.reservation.TotalPrice.toFixed(2)} EUR</li>
              )}
            </ul>
          </div>

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
