"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Loader2, Search, XCircle, CheckCircle2, Info } from "lucide-react"
import { apiFetch } from "@/lib/experticket/client"

interface CancellationCheckResult {
  IsCancellable?: boolean
  Cancellable?: boolean
  Amount?: number
  Currency?: string
  Message?: string
  Policies?: Record<string, unknown>[]
}

export default function CancellationsPage() {
  const [txId, setTxId] = useState("")
  const [checking, setChecking] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [checkResult, setCheckResult] = useState<CancellationCheckResult | null>(null)
  const [cancelComplete, setCancelComplete] = useState(false)
  const [reason, setReason] = useState("0")
  const [error, setError] = useState<string | null>(null)

  async function handleCheck() {
    if (!txId.trim()) return
    setChecking(true)
    setError(null)
    setCheckResult(null)
    setCancelComplete(false)

    try {
      const res = await apiFetch("/api/experticket/cancellation", {
        method: "POST",
        body: JSON.stringify({
          action: "check",
          saleId: txId.trim(),
        }),
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
          reason: parseInt(reason, 10),
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

  const isCancellable = checkResult?.IsCancellable || checkResult?.Cancellable

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Cancellations</h1>
        <p className="text-muted-foreground mt-1">Check eligibility and process transaction cancellations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Cancellation Eligibility</CardTitle>
          <CardDescription>
            Enter a Transaction ID to check if it can be cancelled and what the refund policy is
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="cancelTxId">Transaction ID</Label>
              <Input
                id="cancelTxId"
                placeholder="Enter transaction ID..."
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
            </div>
            <Button onClick={handleCheck} disabled={checking || !txId.trim()}>
              {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Check
            </Button>
          </div>
        </CardContent>
      </Card>

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isCancellable ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Cancellable
                </Badge>
              ) : (
                <Badge variant="destructive">Not Cancellable</Badge>
              )}
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
