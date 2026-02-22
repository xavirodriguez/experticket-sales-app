/**
 * @module TransactionsPage
 * @description Page for searching and viewing details of completed transactions.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
  const [searchId, setSearchId] = useState("")
  const [searchedId, setSearchedId] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Record<string, unknown> | null>(null)
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
    setSearchedId(searchId.trim())
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse(txData, ["Transactions"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-muted-foreground mt-1">Search and manage completed transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Enter a Transaction ID or access date range to find transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="txSearch">Transaction ID</Label>
              <Input
                id="txSearch"
                placeholder="Enter transaction ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !searchId.trim()}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
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

      {selectedTx ? (
        <TransactionDetail
          transaction={selectedTx}
          onBack={() => setSelectedTx(null)}
        />
      ) : (
        transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>{transactions.length} transaction(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx, i) => (
                    <TableRow key={String(tx.SaleId || tx.TransactionId || tx.Id || i)}>
                      <TableCell className="font-mono text-sm">
                        {String(tx.SaleId || tx.TransactionId || tx.Id || "N/A")}
                      </TableCell>
                      <TableCell>{String(tx.TransactionDateTime || tx.DateTime || tx.Date || "N/A")}</TableCell>
                      <TableCell>
                        <StatusBadge status={String(tx.Status || tx.TransactionStatus || "Unknown")} />
                      </TableCell>
                      <TableCell>
                        {tx.TotalPrice !== undefined
                          ? `${Number(tx.TotalPrice).toFixed(2)} EUR`
                          : tx.TotalAmount !== undefined
                            ? `${Number(tx.TotalAmount).toFixed(2)} ${String(tx.Currency || "EUR")}`
                            : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedTx(tx)}>
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      )}

      {searchedId && !isLoading && transactions.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No transactions found for the given ID.</p>
          </CardContent>
        </Card>
      )}
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

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="self-start" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Results
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction {txId}</CardTitle>
            <CardDescription>Full transaction details</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/experticket/documents?transactionId=${txId}`, "_blank")}
            >
              <FileText className="mr-1 h-3 w-3" />
              Documents
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/experticket/accesscodes?transactionId=${txId}`, "_blank")}
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
                    Are you sure you want to cancel transaction {txId}? This action may not be reversible.
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
