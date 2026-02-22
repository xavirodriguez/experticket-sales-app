/**
 * @module CancellationsPage
 * @description Page for checking cancellation eligibility and processing refunds for transactions.
 */

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/experticket/client"
import { SearchCard } from "@/components/search-card"
import { CancellationResultCard } from "./cancellation-result-card"
import { CANCELLATION_REASONS } from "@/lib/constants"

/**
 * Main Cancellations Page component.
 * Provides a specialized interface for handling refunds and cancellations.
 */
export default function CancellationsPage() {
  const [txId, setTxId] = useState("")
  const [checking, setChecking] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)
  const [cancelComplete, setCancelComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Checks if the transaction can be cancelled and retrieves the refund amount.
   */
  async function handleCheck(id: string) {
    setTxId(id)
    setChecking(true)
    setError(null)
    setCheckResult(null)
    setCancelComplete(false)

    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({
          action: "check",
          saleId: id,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.ErrorMessage || "Failed to check cancellation eligibility")
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
    if (!txId) return
    setCancelling(true)
    setError(null)

    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({
          action: "confirm",
          saleId: txId,
          reason: CANCELLATION_REASONS.DEFAULT,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.ErrorMessage || "Failed to process cancellation")
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cancellations</h1>
        <p className="text-muted-foreground mt-1">Check eligibility and process transaction cancellations</p>
      </div>

      <SearchCard
        title="Check Cancellation Eligibility"
        description="Enter a Transaction ID to check if it can be cancelled"
        label="Transaction ID"
        placeholder="Enter transaction ID..."
        isLoading={checking}
        onSearch={handleCheck}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {cancelComplete && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h2 className="text-2xl font-bold text-foreground">Cancellation Processed</h2>
            <p className="text-muted-foreground">
              Transaction <span className="font-mono font-semibold">{txId}</span> has been cancelled.
            </p>
          </CardContent>
        </Card>
      )}

      {checkResult && (
        <CancellationResultCard
          checkResult={checkResult}
          cancelling={cancelling}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  )
}
