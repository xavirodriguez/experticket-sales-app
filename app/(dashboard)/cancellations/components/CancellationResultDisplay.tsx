"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Info, Loader2, XCircle } from "lucide-react"

/**
 * Data structure for the cancellation check result.
 */
export interface CancellationCheckResult {
  IsCancellable?: boolean
  Cancellable?: boolean
  Amount?: number
  Currency?: string
  Message?: string
  Policies?: Record<string, unknown>[]
}

interface CancellationResultDisplayProps {
  /** The result of the cancellation eligibility check. */
  result: CancellationCheckResult
  /** Whether a cancellation is currently being processed. */
  isProcessing: boolean
  /** Callback to confirm and initiate the cancellation. */
  onConfirm: () => void
}

/**
 * Component for displaying the result of a cancellation check and providing a confirmation action.
 */
export function CancellationResultDisplay({
  result,
  isProcessing,
  onConfirm,
}: CancellationResultDisplayProps) {
  const isCancellable = result.IsCancellable || result.Cancellable

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CancellationStatusBadge isCancellable={!!isCancellable} />
          <span>Cancellation Check Result</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result.Message && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>{result.Message}</AlertDescription>
          </Alert>
        )}

        {result.Amount !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Refund Amount:</span>
            <span className="text-xl font-bold">
              {result.Amount.toFixed(2)} {result.Currency || "EUR"}
            </span>
          </div>
        )}

        <CancellationPolicies policies={result.Policies} />

        {isCancellable && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button variant="destructive" onClick={onConfirm} disabled={isProcessing}>
                {isProcessing ? (
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

function CancellationStatusBadge({ isCancellable }: { isCancellable: boolean }) {
  if (isCancellable) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Cancellable
      </Badge>
    )
  }
  return <Badge variant="destructive">Not Cancellable</Badge>
}

function CancellationPolicies({ policies }: { policies?: Record<string, unknown>[] }) {
  if (!policies || policies.length === 0) return null

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Cancellation Policies
        </h3>
        <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-48 font-mono">
          {JSON.stringify(policies, null, 2)}
        </pre>
      </div>
    </>
  )
}
