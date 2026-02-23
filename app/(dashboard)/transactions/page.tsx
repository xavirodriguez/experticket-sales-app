/**
 * @module TransactionsPage
 * @description Page for searching and viewing details of completed transactions.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search } from "lucide-react"
import { fetcher, normalizeApiResponse } from "@/lib/experticket/client"
import { PageHeader } from "@/components/experticket/PageHeader"
import { ErrorAlert } from "@/components/experticket/ErrorAlert"
import { Card, CardContent } from "@/components/ui/card"
import { TransactionSearch } from "./components/TransactionSearch"
import { TransactionResultsTable } from "./components/TransactionResultsTable"
import { TransactionDetailsView } from "./components/TransactionDetailsView"
import type { Transaction } from "@/lib/experticket/types"

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
    searchedTxId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  /**
   * Handles the search action.
   */
  function handleSearch() {
    if (!txIdSearch.trim()) return
    setError(null)
    setSelectedTx(null)
    setSearchedTxId(txIdSearch.trim())
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse<Transaction>(txData, ["Transactions"])

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <PageHeader
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
