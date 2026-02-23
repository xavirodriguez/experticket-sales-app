/**
 * @module CancellationsPage
 * @description Page for checking cancellation eligibility and processing refunds for transactions.
 */

"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Info, Loader2, XCircle } from "lucide-react"
import { apiFetch } from "@/lib/experticket/client"
import { StatusBadge } from "@/components/status-badge"
import { SearchCard } from "@/components/experticket/SearchCard"
import { PageHeader } from "@/components/experticket/PageHeader"
import { ErrorAlert } from "@/components/experticket/ErrorAlert"
import { CancellationSuccessDisplay } from "./components/CancellationSuccessDisplay"
import { DEFAULT_CANCELLATION_REASON } from "@/lib/experticket/constants"

/**
 * Result of a cancellation eligibility check.
 */
interface CancellationCheckResult {
  /** Whether the transaction is technically eligible for cancellation. */
  IsCancellable?: boolean
  /** Alias for IsCancellable. */
  Cancellable?: boolean
  /** The amount to be refunded. */
  Amount?: number
  /** Currency of the refund amount. */
  Currency?: string
  /** Status message from the API. */
  Message?: string
  /** Detailed cancellation policies applicable to this transaction. */
  Policies?: Record<string, unknown>[]
}

/**
 * Main Cancellations Page component.
 * Provides a specialized interface for handling refunds and cancellations.
 */
export default function CancellationsPage() {
  const [txId, setTxId] = useState("")
  const [checking, setChecking] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkResult, setCheckResult] = useState<CancellationCheckResult | null>(null)
  const [cancelComplete, setCancelComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCancellable = Boolean(checkResult?.IsCancellable || checkResult?.Cancellable)

  /**
   * Checks if the transaction can be cancelled and retrieves the refund amount.
   */
  async function handleCheck() {
    if (!txId.trim()) return
    setChecking(true)
    setError(null)
    setCheckResult(null)
    setCancelComplete(false)

    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({ action: "check", saleId: txId.trim() }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to check cancellation eligibility")
      }

      const data = await res.json()
      setCheckResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setChecking(false)
    }
  }

  /**
   * Finalizes the cancellation and processes the refund.
   */
  async function handleConfirmCancel() {
    if (!txId.trim()) return
    setCancelling(true)
    setError(null)

    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({
          action: "confirm",
          saleId: txId.trim(),
          reason: DEFAULT_CANCELLATION_REASON,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to process cancellation")
      }

      setCancelComplete(true)
      setCheckResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Cancellations"
        description="Check eligibility and process transaction cancellations"
      />

      <SearchCard
        title="Check Cancellation Eligibility"
        description="Enter a Transaction ID to check if it can be cancelled and what the refund policy is"
        inputLabel="Transaction ID"
        inputPlaceholder="Enter transaction ID..."
        searchValue={txId}
        onSearchValueChange={setTxId}
        onSearch={handleCheck}
        isLoading={checking}
      />

      {error && <ErrorAlert message={error} />}

      {cancelComplete && <CancellationSuccessDisplay txId={txId} />}

      {checkResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusBadge status={isCancellable ? "Cancellable" : "Not Cancellable"} />
              <span>Cancellation Check Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {checkResult.Message && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{checkResult.Message}</AlertDescription>
              </Alert>
            )}

            {checkResult.Amount !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Refund Amount:</span>
                <span className="text-xl font-bold">
                  {checkResult.Amount.toFixed(2)} {checkResult.Currency || "EUR"}
                </span>
              </div>
            )}

            {checkResult.Policies && checkResult.Policies.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Cancellation Policies
                  </h3>
                  <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-48 font-mono">
                    {JSON.stringify(checkResult.Policies, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {isCancellable && (
              <>
                <Separator />
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Confirm Cancellation
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

