"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { apiFetch } from "@/lib/experticket/client"
import { SearchCard } from "@/components/experticket/SearchCard"
import { DEFAULT_CANCELLATION_REASON } from "@/lib/experticket/constants"
import {
  CancellationResultDisplay,
  type CancellationCheckResult,
} from "./components/CancellationResultDisplay"
import { CancellationSuccessDisplay } from "./components/CancellationSuccessDisplay"

/**
 * Page component for checking cancellation eligibility and processing cancellations.
 */
export default function CancellationsPage() {
  const [txId, setTxId] = useState("")
  const [checking, setChecking] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkResult, setCheckResult] = useState<CancellationCheckResult | null>(null)
  const [cancelComplete, setCancelComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
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

  const handleConfirmCancel = async () => {
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
      <CancellationsHeader
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
        <CancellationResultDisplay
          result={checkResult}
          isProcessing={cancelling}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  )
}

function CancellationsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
