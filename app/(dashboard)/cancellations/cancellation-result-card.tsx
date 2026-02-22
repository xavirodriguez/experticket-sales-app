/**
 * @module CancellationResultCard
 * @description Sub-component for displaying the result of a cancellation eligibility check.
 */

"use client"

import { Info, Loader2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StatusBadge } from "@/components/status-badge"

interface CancellationCheckResult {
  IsCancellable?: boolean
  Cancellable?: boolean
  Amount?: number
  Currency?: string
  Message?: string
  Policies?: Record<string, unknown>[]
}

interface CancellationResultCardProps {
  checkResult: CancellationCheckResult
  cancelling: boolean
  onConfirm: () => void
}

export function CancellationResultCard({
  checkResult,
  cancelling,
  onConfirm,
}: CancellationResultCardProps) {
  const isCancellable = checkResult.IsCancellable || checkResult.Cancellable

  return (
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
                onClick={onConfirm}
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
  )
}
