/**
 * @module TransactionsPage
 * @description Page for searching and viewing details of completed transactions.
 */

"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { fetcher } from "@/lib/experticket/client"
import { normalizeApiResponse } from "@/lib/experticket/utils"
import { PageHeader } from "@/components/experticket/PageHeader"
import { ErrorAlert } from "@/components/experticket/ErrorAlert"
import { TransactionSearch } from "./components/TransactionSearch"
import { TransactionDetailsView } from "./components/TransactionDetailsView"
import { TransactionResultsTable } from "./components/TransactionResultsTable"
import type { DomainTransaction } from "@/lib/experticket/adapter"

/**
 * Main Transactions Page component.
 * Allows users to search for transactions by ID and view their full details.
 */
export default function TransactionsPage() {
  const [txIdSearch, setTxIdSearch] = useState("")
  const [searchedTxId, setSearchedTxId] = useState<string | undefined>(undefined)
  const [selectedTx, setSelectedTx] = useState<DomainTransaction | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  /**
   * Fetches transaction data when a search ID is provided.
   */
  const { data: txData, isLoading, error: swrError } = useSWR(
    searchedTxId ? `/api/experticket/transaction?SaleId=${encodeURIComponent(searchedTxId)}` : null,
    fetcher
  )

  /**
   * Handles the search action.
   */
  function handleSearch() {
    if (!txIdSearch.trim()) return
    setError(undefined)
    setSelectedTx(undefined)
    setSearchedTxId(txIdSearch.trim())
  }

  /**
   * Normalizes the API response into an array of transactions.
   */
  const transactions = normalizeApiResponse<DomainTransaction>(txData, "transactions")

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

      {(error || swrError) && (
        <ErrorAlert message={error || (swrError instanceof Error ? swrError.message : "Failed to fetch transactions")} />
      )}

      {selectedTx ? (
        <TransactionDetailsView transaction={selectedTx} onBack={() => setSelectedTx(undefined)} />
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
