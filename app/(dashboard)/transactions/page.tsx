"use client"

import { useState } from "react"
import useSWR from "swr"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Search, AlertCircle } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"
import { normalizeApiResponse } from "@/lib/experticket/utils"
import { TransactionSearch } from "./components/TransactionSearch"
import { TransactionResultsTable } from "./components/TransactionResultsTable"
import { TransactionDetailsView } from "./components/TransactionDetailsView"
import type { Transaction } from "@/lib/experticket/types"

/**
 * Main page component for managing Experticket transactions.
 * Handles searching, listing, and viewing transaction details.
 *
 * @returns The rendered transactions page.
 */
export default function TransactionsPage() {
  const [txIdSearch, setTxIdSearch] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | null>(null)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: transactionsResponse, isLoading } = useSWR(
    searchedTxId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  const handleSearch = () => {
    if (!txIdSearch.trim()) return
    setError(null)
    setSelectedTx(null)
    setSearchedTxId(txIdSearch.trim())
  }

  const transactions = normalizeApiResponse<Transaction>(transactionsResponse, "Transactions")

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
 * Renders the page header.
 */
function TransactionsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

/**
 * Renders an error alert.
 */
function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
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
