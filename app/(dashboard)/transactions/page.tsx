/**
 * @module TransactionsPage
 * @description Page for searching and viewing details of completed transactions.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Loader2, AlertCircle, Eye, FileText, QrCode, XCircle, ArrowLeft } from "lucide-react"
import { apiFetch, fetcher, normalizeApiResponse } from "@/lib/experticket/client"
import { StatusBadge } from "@/components/status-badge"

/**
 * Main Transactions Page component.
 * Allows users to search for transactions by ID and view their full details.
 */
export default function TransactionsPage() {
  const [txIdSearch, setTxIdSearch] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetches transaction data when a search ID is provided.
   */
  const { data: txData, isLoading } = useSWR(
    searchedId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedId)}` : null,
    fetcher
  )

  /**
   * Handles the search action.
   */
  function handleSearch() {
    if (!searchId.trim()) return
    setError(null)
    setSelectedTx(null)
    setSearchedTxId(txIdSearch.trim())
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse(txData, ["Transactions"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <TransactionsHeader
        title="Transactions"
        description="Search and manage completed transactions"
      />

      <TransactionSearch
        searchId={txIdSearch}
        onSearchIdChange={setTxIdSearch}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && <ErrorAlert message={error} />}

      {selectedTx ? (
        <TransactionDetailsView transaction={selectedTx} onBack={() => setSelectedTx(null)} />
      ) : (
        <TransactionResultsTable
          transactions={transactions}
          onSelectTransaction={setSelectedTx}
        />
      )}

      {searchedTxId && !isLoading && transactions.length === 0 && !error && <NoResultsFound />}
    </div>
  )
}

/**
 * Props for the {@link TransactionDetail} component.
 */
interface TransactionDetailProps {
  /** The transaction data object. */
  transaction: Record<string, unknown>
  /** Callback to return to the search results. */
  onBack: () => void
}

/**
 * Component for displaying the full details of a single transaction.
 */
function TransactionDetail({ transaction, onBack }: TransactionDetailProps) {
  const [cancelDialog, setCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelResult, setCancelResult] = useState<string | null>(null)

  const txId = String(transaction.SaleId || transaction.TransactionId || transaction.Id || "")

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
          transactionId: txId,
        }),
      })
      const data = await res.json()
      if (data.IsCancellable || data.Cancellable) {
        const confirmRes = await apiFetch("/api/experticket/cancellation", {
          method: "POST",
          body: JSON.stringify({
            action: "confirm",
            transactionId: txId,
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
}

/**
 * Renders a "no results" message.
 */
function NoResultsFound() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12">
        <Search className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">No transactions found for the given ID.</p>
      </CardContent>
    </Card>
  )
}
