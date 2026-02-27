"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, FileText, QrCode, XCircle, ArrowLeft } from "lucide-react"
import { apiFetch } from "@/lib/experticket/client"
import { resolveTransactionId } from "@/lib/experticket/utils"
import type { Transaction } from "@/lib/experticket/types"

/**
 * Props for the {@link TransactionDetailsView} component.
 */
interface TransactionDetailsViewProps {
  /** The transaction object to display. */
  transaction: Transaction
  /** Callback to return to the results list. */
  onBack: () => void
}

/**
 * Component for viewing full transaction details and performing cancellations.
 *
 * @param props - Component props.
 * @returns The rendered transaction details view.
 */
export function TransactionDetailsView({ transaction, onBack }: TransactionDetailsViewProps) {
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelResult, setCancelResult] = useState<string | null>(null)

  const txId = resolveTransactionId(transaction)

  async function handleCancel() {
    setCancelling(true)
    try {
      const isCancellable = await checkCancellability(txId)
      const result = isCancellable
        ? await confirmCancellation(txId)
        : "This transaction cannot be cancelled."
      setCancelResult(result)
    } catch {
      setCancelResult("Failed to process cancellation request.")
    } finally {
      setCancelling(false)
    }
  }

  const entries = Object.entries(transaction).filter(([, v]) => typeof v !== "object" || v === null)
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
        <TransactionDetailsHeader
          txId={txId}
          cancelDialog={cancelDialog}
          setCancelDialog={setCancelDialog}
          cancelResult={cancelResult}
          cancelling={cancelling}
          onCancel={handleCancel}
        />
        <CardContent className="flex flex-col gap-4">
          <TransactionBasicFields entries={entries} />
          <TransactionNestedFields nestedEntries={nestedEntries} />
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Checks if a transaction is cancellable by querying the internal API.
 */
async function checkCancellability(txId: string): Promise<boolean> {
  const res = await apiFetch("/api/experticket/cancellation", {
    method: "POST",
    body: JSON.stringify({ action: "check", saleId: txId }),
  })
  const data = await res.json()
  return data.IsCancellable || data.Cancellable
}

/**
 * Confirms the cancellation of a transaction via the internal API.
 */
async function confirmCancellation(txId: string): Promise<string> {
  const res = await apiFetch("/api/experticket/cancellation", {
    method: "POST",
    body: JSON.stringify({ action: "confirm", saleId: txId }),
  })
  const data = await res.json()
  return data.Message || "Cancellation processed successfully."
}

/**
 * Renders the basic fields of a transaction.
 */
function TransactionBasicFields({ entries }: { entries: [string, unknown][] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {key}
          </span>
          <span className="text-sm font-medium">{String(value ?? "N/A")}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Renders the nested (object) fields of a transaction as JSON.
 */
function TransactionNestedFields({ nestedEntries }: { nestedEntries: [string, unknown][] }) {
  if (nestedEntries.length === 0) return null

  return (
    <>
      <Separator />
      {nestedEntries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {key}
          </h3>
          <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-64 font-mono">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
    </>
  )
}

/**
 * Renders the header for the transaction details view, including actions and the cancel dialog.
 */
function TransactionDetailsHeader({
  txId,
  cancelDialog,
  setCancelDialog,
  cancelResult,
  cancelling,
  onCancel,
}: {
  txId: string
  cancelDialog: boolean
  setCancelDialog: (open: boolean) => void
  cancelResult: string | null
  cancelling: boolean
  onCancel: () => void
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Transaction {txId}</CardTitle>
        <CardDescription>Full transaction details</CardDescription>
      </div>
      <div className="flex gap-2">
        <ActionButton
          icon={<FileText className="mr-1 h-3 w-3" />}
          label="Documents"
          onClick={() => window.open(`/api/experticket/documents?transactionId=${txId}`, "_blank")}
        />
        <ActionButton
          icon={<QrCode className="mr-1 h-3 w-3" />}
          label="Access Codes"
          onClick={() =>
            window.open(`/api/experticket/accesscodes?transactionId=${txId}`, "_blank")
          }
        />
        <CancelDialog
          txId={txId}
          open={cancelDialog}
          onOpenChange={setCancelDialog}
          result={cancelResult}
          loading={cancelling}
          onConfirm={onCancel}
        />
      </div>
    </CardHeader>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Button size="sm" variant="outline" onClick={onClick}>
      {icon}
      {label}
    </Button>
  )
}

function CancelDialog({
  txId,
  open,
  onOpenChange,
  result,
  loading,
  onConfirm,
}: {
  txId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  result: string | null
  loading: boolean
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            Are you sure you want to cancel transaction {txId}? This action may not be reversible.
          </DialogDescription>
        </DialogHeader>
        {result ? (
          <Alert>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Keep Transaction
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Cancellation
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
