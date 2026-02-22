/**
 * @module TransactionDetail
 * @description Sub-component for displaying full details of a single transaction and handling cancellation requests.
 */

"use client"

import { useState } from "react"
import { ArrowLeft, FileText, QrCode, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiFetch } from "@/lib/experticket/client"
import type { Transaction } from "@/lib/experticket/types"

/**
 * Props for the {@link TransactionDetail} component.
 */
interface TransactionDetailProps {
  /** The transaction data object. */
  transaction: Transaction
  /** Callback to return to the search results. */
  onBack: () => void
}

/**
 * Component for displaying the full details of a single transaction.
 */
export function TransactionDetail({ transaction, onBack }: TransactionDetailProps) {
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelResult, setCancelResult] = useState<string | null>(null)

  const transactionId = String(transaction.SaleId || transaction.TransactionId || transaction.Id || "")

  /**
   * Initiates the cancellation process for this transaction.
   */
  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({
          action: "check",
          saleId: transactionId,
        }),
      })
      const data = await res.json()
      if (data.IsCancellable || data.Cancellable) {
        const confirmRes = await apiFetch("/api/experticket/cancellation", {
          method: "POST",
          body: JSON.stringify({
            action: "confirm",
            saleId: transactionId,
          }),
        })
        const confirmData = await confirmRes.json()
        setCancelResult(confirmData.Message || "Cancellation processed successfully.")
      } else {
        setCancelResult(data.Message || "This transaction cannot be cancelled.")
      }
    } catch {
      setCancelResult("Failed to process cancellation request.")
    } finally {
      setCancelling(false)
    }
  }

  /** Filter top-level flat fields for display. */
  const entries = Object.entries(transaction).filter(
    ([, v]) => typeof v !== "object" || v === null
  )
  /** Filter nested object/array fields for display. */
  const nestedEntries = Object.entries(transaction).filter(
    ([, v]) => typeof v === "object" && v !== null
  )

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="self-start" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Results
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction {transactionId}</CardTitle>
            <CardDescription>Full transaction details</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/experticket/documents?transactionId=${transactionId}`, "_blank")}
            >
              <FileText className="mr-1 h-3 w-3" />
              Documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/experticket/accesscodes?transactionId=${transactionId}`, "_blank")}
            >
              <QrCode className="mr-1 h-3 w-3" />
              Access Codes
            </Button>
            <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
              <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" />
                  Cancel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Transaction</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel transaction {transactionId}? This action may not be reversible.
                  </DialogDescription>
                </DialogHeader>
                {cancelResult ? (
                  <Alert>
                    <AlertDescription>{cancelResult}</AlertDescription>
                  </Alert>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setCancelDialog(false)}>
                      Keep Transaction
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirm Cancellation
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {entries.map(([key, value]) => (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{key}</span>
                <span className="text-sm font-medium">{String(value ?? "N/A")}</span>
              </div>
            ))}
          </div>

          {nestedEntries.length > 0 && (
            <>
              <Separator />
              {nestedEntries.map(([key, value]) => (
                <div key={key} className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{key}</h3>
                  <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-64 font-mono">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
